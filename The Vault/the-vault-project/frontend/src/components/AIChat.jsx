// Inside frontend/src/components/AIChat.jsx

const handleSend = async () => {
  if (!input.trim()) return;
  
  const userMsg = input.trim();
  setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
  setInput('');
  setIsLoading(true);

  try {
    // Call YOUR secure backend, not Google directly
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userPrompt: userMsg, 
        catalog: catalog // Pass the current items so the AI knows what's in stock
      })
    });

    const data = await response.json();
    setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
  } catch (error) {
    setMessages(prev => [...prev, { role: 'assistant', text: "Comms link severed. Try again." }]);
  } finally {
    setIsLoading(false);
  }
};