import { useEffect, useMemo } from "react";
import {
  SignalPicker,
  Transport,
  VoiceOrb,
} from "@thecharlesponti/waveform-react";
import "@thecharlesponti/waveform-react/style.css";

export function WaveformPreview() {
  const transport = useMemo(() => new Transport(), []);

  useEffect(() => () => {
    transport.setSound(false);
  }, [transport]);

  return (
    <section className="sf-wrap sf-waveform-showcase" aria-label="Interactive Waveform demo">
      <div className="sf-waveform-demo rvo">
        <SignalPicker transport={transport} className="sf-waveform-controls" />
        <div className="sf-waveform-orb">
          <VoiceOrb
            transport={transport}
            colorBy="age"
            aria-label="An animated orb showing the pitch, time, and loudness of a sound"
          />
        </div>
        <p className="sf-waveform-note">
          Choose a sound to see its pitch, timing, and loudness move through the orb. Turn sound on to hear it.
        </p>
      </div>
    </section>
  );
}
