import {
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  PageContainer,
  SparkApp,
  Textarea,
} from '@github/spark/components'
import { useKV } from '@github/spark/hooks'
import { Heart, Plus, ThumbsDown, ThumbsUp, User, Warning } from '@phosphor-icons/react'
import * as d3 from 'd3'
import * as React from 'react'
import { createRoot } from 'react-dom/client'

// Simple browser fingerprinting function
const generateFingerprint = () => {
  const screen = `${window.screen.width},${window.screen.height},${window.screen.colorDepth}`
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const languages = navigator.languages?.join(',') || navigator.language
  const platform = navigator.platform
  const fingerprint = `${screen}-${timezone}-${languages}-${platform}`
  return btoa(fingerprint)
}

function VoteChart({ votes }) {
  const chartRef = React.useRef()

  React.useEffect(() => {
    if (!votes.length) return

    d3.select(chartRef.current).selectAll('*').remove()

    const width = 300
    const height = 200
    const radius = Math.min(width, height) / 2

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    const data = [
      { label: 'Stay', value: votes.filter((v) => v.value === 'stay').length },
      { label: 'Go', value: votes.filter((v) => v.value === 'go').length },
    ]

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.label))
      .range(['var(--color-accent-secondary-9)', 'var(--color-accent-9)'])

    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null)

    const arc = d3
      .arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius)

    const paths = svg
      .selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.label))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')

    const percentage = Math.round((data[0].value / votes.length) * 100) || 0
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0em')
      .style('font-size', '2em')
      .style('font-weight', 'bold')
      .text(`${percentage}%`)

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .style('font-size', '0.9em')
      .style('fill', 'var(--color-fg-secondary)')
      .text('Stay Together')
  }, [votes])

  return <div ref={chartRef} className="flex justify-center" />
}

function CreateTracker({ onClose }) {
  const [photo, setPhoto] = React.useState('')
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [trackers, setTrackers] = useKV('trackers', [])

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    const newTracker = {
      id: Date.now(),
      photo,
      name,
      description,
      votes: [],
    }
    setTrackers([...trackers, newTracker])
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-fg-secondary">Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="w-full text-sm text-fg-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-3 file:text-accent-11 hover:file:bg-accent-4"
        />
        {photo && (
          <div className="mt-2">
            <img src={photo} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
          </div>
        )}
      </div>

      <Input placeholder="Their name" value={name} onChange={(e) => setName(e.target.value)} />

      <Textarea
        placeholder="What's the situation?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
      />

      <DialogClose asChild>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!name || !description}
          className="w-full"
        >
          Create Tracker
        </Button>
      </DialogClose>
    </div>
  )
}

function TrackerCard({ tracker, onSelect }) {
  return (
    <Card className="cursor-pointer hover:bg-neutral-2" onClick={() => onSelect(tracker)}>
      <div className="flex items-center gap-4">
        {tracker.photo ? (
          <img
            src={tracker.photo}
            alt={tracker.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-accent-3 flex items-center justify-center">
            <User className="w-8 h-8 text-accent-9" />
          </div>
        )}
        <div>
          <h3 className="font-semibold">{tracker.name}</h3>
          <p className="text-sm text-fg-secondary line-clamp-2">{tracker.description}</p>
        </div>
      </div>
    </Card>
  )
}

function VoteScreen({ tracker, onBack }) {
  const [votes, setVotes] = React.useState(tracker.votes)
  const [hasVoted, setHasVoted] = React.useState(false)
  const [trackers, setTrackers] = useKV('trackers', [])

  React.useEffect(() => {
    const fingerprint = generateFingerprint()
    const userHasVoted = votes.some((vote) => vote.fingerprint === fingerprint)
    setHasVoted(userHasVoted)
  }, [votes])

  const handleVote = (value) => {
    if (hasVoted) return

    const fingerprint = generateFingerprint()
    const newVotes = [...votes, { value, timestamp: Date.now(), fingerprint }]

    // Update both local state and tracker in storage
    setVotes(newVotes)
    const updatedTrackers = trackers.map((t) =>
      t.id === tracker.id ? { ...t, votes: newVotes } : t
    )
    setTrackers(updatedTrackers)
    setHasVoted(true)
  }

  return (
    <div className="space-y-6">
      <Button variant="plain" onClick={onBack}>
        ← Back to trackers
      </Button>

      <div className="text-center space-y-4">
        {tracker.photo ? (
          <img
            src={tracker.photo}
            alt={tracker.name}
            className="w-32 h-32 rounded-full object-cover mx-auto"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-accent-3 flex items-center justify-center mx-auto">
            <User className="w-16 h-16 text-accent-9" />
          </div>
        )}
        <h2 className="text-2xl font-bold">{tracker.name}</h2>
        <p className="text-fg-secondary">{tracker.description}</p>
      </div>

      {votes.length > 0 && (
        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Based on {votes.length} votes</h2>
            <VoteChart votes={votes} />
            {votes.length < 3 && (
              <div className="flex items-center justify-center gap-2 text-fg-secondary">
                <Warning className="text-accent-secondary-9" />
                <span>Get more votes for better insights!</span>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="primary"
          icon={<ThumbsUp />}
          onClick={() => handleVote('stay')}
          disabled={hasVoted}
          className="bg-accent-secondary-9 hover:bg-accent-secondary-10"
        >
          Stay Together
        </Button>
        <Button
          variant="primary"
          icon={<ThumbsDown />}
          onClick={() => handleVote('go')}
          disabled={hasVoted}
          className="bg-accent-9 hover:bg-accent-10"
        >
          Time to Go
        </Button>
      </div>

      {hasVoted && (
        <p className="text-center text-fg-secondary italic">
          Thanks for voting! You've already shared your wisdom.
        </p>
      )}
    </div>
  )
}

function App() {
  const [trackers] = useKV('trackers', [])
  const [selectedTracker, setSelectedTracker] = React.useState(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  if (selectedTracker) {
    return (
      <SparkApp>
        <PageContainer maxWidth="small">
          <VoteScreen tracker={selectedTracker} onBack={() => setSelectedTracker(null)} />
        </PageContainer>
      </SparkApp>
    )
  }

  return (
    <SparkApp>
      <PageContainer maxWidth="small">
        <div className="space-y-6 py-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-accent-12">Should They Stay or Go?</h1>
            <p className="text-fg-secondary">Get anonymous relationship advice from friends</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" icon={<Plus />} className="w-full">
                Create New Tracker
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Relationship Tracker</DialogTitle>
              </DialogHeader>
              <CreateTracker onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          <div className="space-y-4">
            {trackers.map((tracker) => (
              <TrackerCard key={tracker.id} tracker={tracker} onSelect={setSelectedTracker} />
            ))}

            {trackers.length === 0 && (
              <div className="text-center py-8 text-fg-secondary">
                <p>No trackers yet! Create one to get started.</p>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </SparkApp>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
