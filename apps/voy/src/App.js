import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import "./index.css";
import { calculatePenDuration } from "./solution";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dosages, setDosages] = useState();

  useEffect(() => {
    async function fetchDosages() {
      const res = await fetch("http://localhost:3000/api/medication-schedule");
      const body = await res.json();
      const numOfWeeks = calculatePenDuration(body.weeklyDosages, body.penCapacity);
      const r = body.weeklyDosages.reduce((r, curr, i) => {
        console.log(i <= numOfWeeks);
        if (i <= numOfWeeks - 1) {
          return [...r, curr];
        }
        return r;
      }, []);

      console.log(r);
      setDosages(r);
      setIsLoading(false);
    }

    fetchDosages();
  }, []);

  return (
    <div className="container">
      <div className="list-container">
        {!isLoading && dosages ? (
          <>
            <h2>Total Weeks</h2>
            <ul className="list">
              {dosages.map((dose, i) => (
                <li key={i} className="list-item">
                  <span>Week {i + 1}: </span>
                  <span>{dose} MG</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>No dosages</p>
        )}
      </div>
    </div>
  );
};

export default App;
