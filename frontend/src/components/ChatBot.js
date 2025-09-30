import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import { ArrowBack, Send, Clear, SmartToy, Person } from '@mui/icons-material';
import { sendChatMessage } from '../services/api';

const ChatBot = ({ sessionId, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError(null);

    try {
      const result = await sendChatMessage(sessionId, userMessage);
      
      if (result.error) {
        setError(result.error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${result.error}` 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: result.response 
        }]);
      }
    } catch (err) {
      const errorMsg = 'Error sending message: ' + err.message;
      setError(errorMsg);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMsg 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={onBack}>
          Back to Menu
        </Button>
        <Typography variant="h4" component="h1">
          💬 Chat with DataBot 
        </Typography>
        <Button startIcon={<Clear />} onClick={clearChat} color="secondary">
          Clear Chat
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          <strong>Ask any question about your uploaded dataset.</strong> The Gemini AI will analyze your data and provide answers, summaries, or generate reports as requested.
        </Typography>
      </Paper>

      {/* Chat Messages */}
      <Paper 
        elevation={2} 
        sx={{ 
          height: '500px', 
          mb: 3, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
          <Typography variant="h6">Chat History</Typography>
        </Box>
        
        <Box 
          sx={{ 
            flexGrow: 1, 
            p: 2, 
            overflowY: 'auto',
            backgroundColor: '#f8f9fa'
          }}
        >
          {messages.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography color="text.secondary">
                Start a conversation by asking about your data!
              </Typography>
            </Box>
          ) : (
            messages.map((message, index) => (
              <Box key={index} mb={2}>
                <Card 
                  elevation={1}
                  sx={{
                    maxWidth: '80%',
                    ml: message.role === 'user' ? 'auto' : 0,
                    mr: message.role === 'assistant' ? 'auto' : 0,
                    backgroundColor: message.role === 'user' ? 'primary.light' : 'background.paper'
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      {message.role === 'user' ? <Person /> : <SmartToy />}
                      <Typography 
                        variant="subtitle2" 
                        sx={{ ml: 1, fontWeight: 'bold' }}
                      >
                        {message.role === 'user' ? 'You' : 'DataBot'}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        color: message.role === 'user' ? 'white' : 'text.primary'
                      }}
                    >
                      {message.content}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))
          )}
          
          {loading && (
            <Box display="flex" alignItems="center" mb={2}>
              <Card elevation={1} sx={{ maxWidth: '80%' }}>
                <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <SmartToy sx={{ mr: 1 }} />
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                  <Typography variant="body2">DataBot is thinking...</Typography>
                </CardContent>
              </Card>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
      </Paper>

      {/* Input Area */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask anything about your data (e.g., 'Summarize the dataset', 'What are the top 5 values in column X?', 'Generate a report', etc.)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <Button
            variant="contained"
            endIcon={loading ? <CircularProgress size={20} /> : <Send />}
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Sending' : 'Send'}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ChatBot;