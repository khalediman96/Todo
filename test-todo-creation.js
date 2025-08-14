// Simple test script to test todo creation
const fetch = require('node-fetch');

async function testTodoCreation() {
  try {
    console.log('🧪 Testing todo creation...');
    
    const todoData = {
      title: 'Test Todo',
      description: 'This is a test todo',
      priority: 'medium',
      status: 'new',
      completed: false,
      tags: ['test'],
      isRecurring: false
    };
    
    console.log('📝 Sending todo data:', todoData);
    
    const response = await fetch('http://localhost:3000/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📡 Response text:', responseText);
    
    if (response.ok) {
      console.log('✅ Todo creation successful!');
    } else {
      console.log('❌ Todo creation failed');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testTodoCreation();
