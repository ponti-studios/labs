<script lang="ts">
  let message = 'Welcome to Polly!';
  let inputText = '';
  let result = '';

  async function sendRequest() {
    try {
      const response = await fetch('http://localhost:4000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputText })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      result = data.result || JSON.stringify(data);
    } catch (error) {
      result = `Error: ${error.message}`;
    }
  }
</script>

<main>
  <h1>{message}</h1>
  <div class="card">
    <input 
      type="text" 
      bind:value={inputText} 
      placeholder="Enter text..."
    />
    <button on:click={sendRequest}>Send</button>
    
    {#if result}
      <div class="result">
        <h2>Result:</h2>
        <p>{result}</p>
      </div>
    {/if}
  </div>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 320px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    font-size: 1.5em;
    font-weight: 500;
  }

  .card {
    padding: 1em;
    border-radius: 0.5em;
    background-color: #f9f9f9;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  input {
    padding: 0.5em;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
  }

  button {
    background-color: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5em 1em;
    cursor: pointer;
    font-weight: 500;
  }

  button:hover {
    background-color: #e63700;
  }

  .result {
    margin-top: 1em;
    text-align: left;
    border-top: 1px solid #eee;
    padding-top: 1em;
  }

  .result h2 {
    font-size: 1em;
    margin: 0 0 0.5em 0;
  }

  .result p {
    margin: 0;
    word-break: break-word;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    min-width: 320px;
    min-height: 320px;
  }
</style>