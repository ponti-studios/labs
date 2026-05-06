import { Card, CardHeader, CardTitle, CardContent, Input, Label, Slider } from "@pontistudios/ui";
import { useState, useEffect } from "react";

export default function TimeTogetherRoute() {
  const [yearsTogether, setYearsTogether] = useState(3);
  const [majorVacation, setMajorVacation] = useState(14);
  const [miniVacation, setMiniVacation] = useState(3);
  const [hangsPerWeek, setHangsPerWeek] = useState(3);
  const [variance, setVariance] = useState(0.7);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const result =
      yearsTogether * (hangsPerWeek * 52 * variance + miniVacation * 2 + majorVacation);
    setTotal(Number(result.toFixed(1)));
  }, [yearsTogether, majorVacation, miniVacation, hangsPerWeek, variance]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Time Together Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="yearsTogether">Years Together</Label>
            <Input
              id="yearsTogether"
              type="number"
              value={yearsTogether}
              onChange={(e) => setYearsTogether(parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="majorVacation">Major Vacation Days/Year</Label>
            <Input
              id="majorVacation"
              type="number"
              value={majorVacation}
              onChange={(e) => setMajorVacation(parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="miniVacation">Mini Vacations/Year</Label>
            <Input
              id="miniVacation"
              type="number"
              value={miniVacation}
              onChange={(e) => setMiniVacation(parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hangsPerWeek">Hangouts per Week</Label>
            <Input
              id="hangsPerWeek"
              type="number"
              value={hangsPerWeek}
              onChange={(e) => setHangsPerWeek(parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Consistency Factor: {variance.toFixed(2)}</Label>
            <Slider
              value={[variance]}
              onValueChange={(values) => setVariance(values[0])}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="mt-6 p-4 bg-slate-100 rounded-lg">
            <div className="text-center">
              <span className="text-lg font-semibold">Total Days Together: </span>
              <span className="text-2xl text-blue-600">{total}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
