# Designing a Daily Reality TV Game

When we first set out to build a daily game for reality TV fans, the obvious inspiration was Wordle. It seemed like the perfect template: one puzzle per day, a simple mechanic, social sharing, and a feeling of accomplishment. The hope was to build "Wordle, but for Bravo."

The first implementation immediately exposed several problems. Wordle depends on properties that reality-TV content simply doesn't have. Answers need to be a consistent length, preferably around five letters. They need to exist in a reliable dictionary. Multiple spellings, nicknames, phrases, and titles all complicate validation. Reality TV, by contrast, is made up of people, relationships, events, rumors, and storylines. Trying to compress those into five-letter words was fighting the material rather than embracing it.

Initially, it seemed like the solution might be trivia. Reality television is rich with memorable details: who started a fight, who revealed a rumor, who attended a reunion, who unfollowed whom. An LLM can generate these questions extremely well from current articles. The generation pipeline is almost trivial:

```
Article
↓
LLM
↓
Trivia question
```

But while trivia is easy to generate, it lacks one of Wordle's defining qualities: progress.

Wordle is satisfying because every guess produces new information. Players begin with almost no knowledge and gradually narrow the search space. Every green and yellow tile rewards experimentation and creates momentum. Trivia, by contrast, ends immediately. You either know the answer or you don't. There is no discovery process.

This realization led us away from words and toward a deeper question: what actually makes Wordle enjoyable?

It isn't words.

It isn't language.

It's progressive discovery.

That prompted us to explore games built around hidden structure instead of hidden words. Could the answer be a storyline? A cast member? A relationship? A recent news event? We experimented with clue ladders, deduction games, social strategy questions, and inference-based puzzles. Most of these were interesting to discuss but failed one critical engineering constraint.

They required live reasoning.

Many designs looked like this:

```
Article
↓
LLM
↓
Puzzle

User Guess
↓
LLM
↓
Feedback
↓
LLM
↓
Feedback
```

From a product perspective, this was unacceptable. Every user guess would require another model call, increasing latency, cost, and the possibility of inconsistent answers. A successful daily game must behave like Wordle or Connections: all of the intelligence happens before the player arrives.

That constraint fundamentally changed the search.

The desired architecture became:

```
Today's Articles
↓
LLM
↓
Finished Puzzle
↓
Millions of Players
```

No runtime AI.

Once we accepted that constraint, the search shifted from "What game is most fun?" to "What existing game mechanic naturally fits automatically generated news?"

This led us to Connections.

At first glance, Connections appeared promising because large language models are remarkably good at grouping related concepts. Every Bravo article naturally contains people, places, events, relationships, and objects. Asking an LLM to generate one hidden category from a single article is straightforward.

For example, an article about Gael Cameron introducing her baby to Captain Sandy and Aesha Scott could easily produce clues like:

- Captain Sandy
- Aesha Scott
- Kayden
- Croatia

with the hidden connection being "Gael Cameron's post-Below Deck family update."

This insight produced an even more scalable pipeline.

Instead of asking an LLM to invent an entire Connections board from scratch, we could scrape the top four Bravo articles each day and ask the model to generate one category from each article. The daily puzzle would then consist of four automatically generated groups.

```
Top 4 Bravo Articles
↓
Generate 1 Connections Group Per Article
↓
Combine Into Daily Board
```

This is dramatically simpler than manually constructing categories.

However, prototyping the idea exposed another subtle challenge.

Connections does not merely require related words.

It requires clues that point toward a hidden concept without simply revealing it.

For example:

```
Andrea
Lexi
Baby
Announcement
```

is a poor group because "baby announcement" is already visible inside the clues.

Connections succeeds because the category is hidden.

```
Dog
Cat
Horse
Cow
```

requires the player to infer "Animals."

The clues are evidence.

The category is the discovery.

This distinction became one of the most important lessons of the exploration. The challenge is not generating coherent groups. Large language models can already do that. The challenge is generating clues that feel indirect enough to create an "aha" moment while remaining uniquely associated with the underlying article.

This also highlighted a difference between article summarization and puzzle construction.

An article naturally produces keywords.

A puzzle requires evidence.

Those are related but not identical tasks.

Looking back, the exploration revealed a series of increasingly important constraints.

First, the game cannot depend on word length or dictionaries.

Second, it cannot require runtime inference from the model.

Third, it should be explainable in a single sentence.

Fourth, it should generate automatically from current Bravo news.

Finally, it should preserve the feeling of discovery that makes Wordle and Connections compelling.

At this point, Connections—or something structurally similar—appears to satisfy more of those constraints than any other mechanic we explored. Not because it is a perfect thematic fit for reality television, but because it naturally separates generation from play. The LLM creates the puzzle once. Players solve it without further computation.

Whether the final product ends up being a literal Connections clone or evolves into a related mechanic remains an open question. But the exploration clarified something much more valuable than choosing a game.

It clarified the constraints.

And in product design, constraints often determine the solution long before inspiration does.
