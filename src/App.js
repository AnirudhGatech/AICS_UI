import React, { useState, useRef, useEffect } from 'react';
import {
  TextField, Button, Typography, Paper, Container, Grid, Avatar, CircularProgress,
  useMediaQuery, CssBaseline
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { styled } from '@mui/system';

const theme = createTheme({
  palette: {
    background: {
      default: 'linear-gradient(145deg, #e6e9f0, #eef1f5)',
    },
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#ffad33', // A vibrant color for user messages
    },
    text: {
      primary: '#2e2e2e',
      secondary: '#575757',
    },
  },
  shape: {
    borderRadius: 15,
  },
  shadows: ['none', '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)'],
});

const ChatContainer = styled(Container)(({ theme }) => ({
  height: '90vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '2rem',
  backgroundColor: theme.palette.background.default,
}));

const ChatBubble = styled(Paper)(({ theme }) => ({
  maxWidth: '80%',
  padding: '12px 18px',
  marginBottom: '12px',
  borderRadius: '20px',
  wordWrap: 'break-word',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  backgroundColor: theme.palette.common.white,
  boxShadow: theme.shadows[1],
}));

const UserBubble = styled(ChatBubble)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.getContrastText(theme.palette.secondary.main),
  alignSelf: 'flex-end',
  marginRight: '1rem',
}));

const BotBubble = styled(ChatBubble)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  alignSelf: 'flex-start',
  marginLeft: '1rem',
}));

const StyledAvatar = styled(Avatar)({
  width: '30px',
  height: '30px',
  marginRight: '0.5rem',
});

function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSearch = async () => {
    setChat((prevChat) => [...prevChat, { type: 'user', text: searchQuery }]);
    setIsLoading(true);
  
    try {
      const response = await fetch('https://tsearch-c7q4.onrender.com/tsearch/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search_query: searchQuery }),
      });
  
      if (!response.ok) {
        throw new Error('Response not OK');
      }
  
      const textContent = await response.text();
      const paragraphs = textContent.split('\n').filter(paragraph => paragraph.trim() !== '');

      setChat((prevChat) => [
        ...prevChat,
        { type: 'bot', text: paragraphs },
      ]);
    } catch (error) {
      console.error("Error:", error.message);
      setChat((prevChat) => [
        ...prevChat,
        { type: 'bot', text: ['Sorry, there was an error processing your request.'] },
      ]);
    } finally {
      setIsLoading(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatContainer maxWidth="md">
        <Typography variant="h5" align="center" gutterBottom style={{ color: theme.palette.text.primary }}>
          GTSearch
        </Typography>
        <div style={{ overflowY: 'scroll', flexGrow: 1 }}>
          {chat.map((message, index) => (
            <div key={index} ref={chatEndRef}>
              {message.type === 'user' ? (
                <UserBubble elevation={3}>
                  <StyledAvatar alt="User" src="/user-avatar.png" />
                  <Typography variant="body2">{message.text}</Typography>
                </UserBubble>
              ) : (
                <BotBubble elevation={3}>
                  <StyledAvatar alt="Bot" src="/bot-avatar.png" />
                  {message.text.map((p, idx) => (
                    <Typography key={idx} variant="body2" component="div">
                      {p.startsWith('-') || p.startsWith('*') ? <ul><li>{p.substring(1).trim()}</li></ul> : p}
                    </Typography>
                  ))}
                </BotBubble>
              )}
            </div>
          ))}
          {isLoading && (
            <BotBubble elevation={3} style={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} />
              <Typography variant="body2" style={{ marginLeft: '10px' }}>Searching...</Typography>
            </BotBubble>
          )}
        </div>
        <Grid container spacing={2} alignItems="center" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `2px solid ${theme.palette.divider}` }}>
          <Grid item xs={isMobile ? 8 : 9}>
            <TextField
              fullWidth
              variant="outlined"
              label="Type your search query here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                style: {
                  backgroundColor: theme.palette.common.white,
                }
              }}
            />
          </Grid>
          <Grid item xs={isMobile ? 4 : 3}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isLoading}
            >
              Search
            </Button>
          </Grid>
        </Grid>
        <Typography variant="body2" style={{ color: theme.palette.text.secondary, fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem' }}>
          GTSearch is prone to errors and may present inaccurate information. It is wise to verify its responses for accuracy, especially when dealing with crucial information.
        </Typography>
      </ChatContainer>
    </ThemeProvider>
  );
}

export default SearchComponent;
