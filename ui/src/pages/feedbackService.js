export async function submitFeedback(data) {
    try {
      const response = await fetch('http://localhost:3000/api/feedback', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Feedback submission failed:', error);
      throw error;
    }
  }
  