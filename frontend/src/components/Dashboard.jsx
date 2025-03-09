import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Container,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import EmailIcon from '@mui/icons-material/Email';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [capsules, setCapsules] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    unlockDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    recipientEmails: '',
  });

  const fetchCapsules = async () => {
    try {
      setError(null);
      const response = await axios.get('/api/capsules/my-capsules');
      // Ensure we have an array of capsules
      const capsulesData = Array.isArray(response.data) ? response.data : [];
      setCapsules(capsulesData);
    } catch (error) {
      console.error('Error fetching capsules:', error);
      setError('Failed to fetch time capsules. Please try again later.');
      toast.error('Failed to fetch time capsules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsules();
  }, []);

  const handleCreateCapsule = async () => {
    try {
      if (!formData.title.trim() || !formData.message.trim() || !formData.unlockDate) {
        toast.error('Please fill in all required fields');
        return;
      }

      const recipientList = formData.recipientEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

      // Format the data to match the mongoose schema
      const capsuleData = {
        title: formData.title.trim(),
        content: formData.message.trim(), // Changed from 'message' to 'content'
        unlockDate: new Date(formData.unlockDate).toISOString(),
        status: 'locked',
        isPublic: false,
        mediaUrls: [], // Added to match schema
        recipients: [] // Will be updated through the send endpoint
      };

      console.log('Sending capsule data:', capsuleData); // For debugging

      const createResponse = await axios.post('/api/capsules', capsuleData);
      console.log('Create response:', createResponse.data); // For debugging
      
      if (recipientList.length > 0) {
        try {
          await axios.post('/api/capsules/send', {
            capsuleId: createResponse.data._id,
            recipientEmails: recipientList
          });
        } catch (sendError) {
          console.error('Error sending to recipients:', sendError.response?.data);
          toast.warning('Capsule created but failed to add some recipients');
        }
      }

      toast.success('Time capsule created successfully!');
      setOpen(false);
      setFormData({
        title: '',
        message: '',
        unlockDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        recipientEmails: '',
      });
      fetchCapsules();
    } catch (error) {
      console.error('Error creating capsule:', error.response?.data || error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to create time capsule';
      toast.error(errorMessage);
    }
  };

  const handleDeleteCapsule = async (id) => {
    if (!id) {
      toast.error('Invalid capsule ID');
      return;
    }

    try {
      // Show confirmation dialog
      if (!window.confirm('Are you sure you want to delete this time capsule?')) {
        return;
      }

      // Find the capsule in our local state for debugging
      const capsuleToDelete = capsules.find(c => c._id === id);
      if (!capsuleToDelete) {
        toast.error('Capsule not found');
        return;
      }

      if (capsuleToDelete.status !== 'locked') {
        toast.error('Cannot delete an unlocked capsule');
        return;
      }

      // Debug log - before API call
      console.log('Attempting to delete capsule:', {
        id,
        capsule: capsuleToDelete,
        url: `/api/capsules/${id}`
      });

      // Make the delete request
      const response = await axios.delete(`/api/capsules/${id}`);

      // Debug log - after API call
      console.log('Delete response:', response);

      if (response.status === 200) {
        toast.success('Time capsule deleted successfully!');
        // Update the local state by removing the deleted capsule
        setCapsules(prevCapsules => prevCapsules.filter(capsule => capsule._id !== id));
      } else {
        throw new Error('Failed to delete capsule');
      }
    } catch (error) {
      // Enhanced error logging
      console.error('Error deleting capsule:', {
        error: error,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete time capsule';
      
      if (error.response?.status === 404) {
        toast.error('Time capsule not found');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to delete this capsule');
      } else if (error.response?.status === 401) {
        toast.error('Please log in again to continue');
      } else if (error.response?.status === 400) {
        // Enhanced 400 error handling with more specific message
        const specificError = errorMessage.includes('remove') 
          ? 'Server error: Please try again later or contact support if the issue persists'
          : errorMessage;
        toast.error(`Cannot delete this capsule: ${specificError}`);
      } else {
        toast.error('Failed to delete time capsule. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    return status === 'locked' ? 'warning' : 'success';
  };

  if (loading) {
    return (
      <Container 
        sx={{ 
          py: 4,
          minHeight: '100vh',
          width: '100%',
          maxWidth: '100% !important'
        }}
      >
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">Loading your time capsules...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container 
        sx={{ 
          py: 4,
          minHeight: '100vh',
          width: '100%',
          maxWidth: '100% !important'
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        width: '100%',
        backgroundColor: theme.palette.background.default,
        pt: 4,
        pb: 4
      }}
    >
      <Container 
        sx={{ 
          maxWidth: '100% !important',
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            mb: 4,
            width: '100%'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            width: '100%'
          }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              My Time Capsules
            </Typography>
            <Button
              variant="contained"
              onClick={() => setOpen(true)}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                width: isMobile ? '100%' : 'auto'
              }}
            >
              Create New Capsule
            </Button>
          </Box>
        </Paper>

        {capsules.length === 0 ? (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: theme.palette.grey[50],
              width: '100%'
            }}
          >
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              No Time Capsules Yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your first time capsule to get started!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
            {capsules.map((capsule) => (
              <Grid item xs={12} sm={6} md={4} key={capsule._id}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                    overflow: 'hidden',
                    width: '100%'
                  }}
                >
                  <CardContent sx={{ 
                    flexGrow: 1,
                    overflow: 'hidden',
                    width: '100%',
                    p: { xs: 2, sm: 3 }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      width: '100%',
                      overflow: 'hidden'
                    }}>
                      {capsule.status === 'locked' ? (
                        <LockIcon color="warning" sx={{ mr: 1, flexShrink: 0 }} />
                      ) : (
                        <LockOpenIcon color="success" sx={{ mr: 1, flexShrink: 0 }} />
                      )}
                      <Typography 
                        variant="h6" 
                        component="div"
                        sx={{ 
                          fontWeight: 'medium',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: '100%'
                        }}
                      >
                        {capsule.title}
                      </Typography>
                    </Box>
                    <Chip
                      icon={capsule.status === 'locked' ? <LockIcon /> : <LockOpenIcon />}
                      label={capsule.status}
                      color={capsule.status === 'locked' ? 'warning' : 'success'}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Unlock Date: {new Date(capsule.unlockDate).toLocaleString()}
                    </Typography>
                    {capsule.status === 'unlocked' && (
                      <Typography 
                        variant="body1"
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {capsule.content}
                      </Typography>
                    )}
                    {capsule.recipients?.length > 0 && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mt: 2,
                        overflow: 'hidden'
                      }}>
                        <EmailIcon fontSize="small" sx={{ mr: 1, flexShrink: 0, color: 'text.secondary' }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Shared with {capsule.recipients.length} recipient{capsule.recipients.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ 
                    justifyContent: 'flex-end', 
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider'
                  }}>
                    {capsule.status === 'locked' && (
                      <Button
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={() => handleDeleteCapsule(capsule._id)}
                        sx={{ 
                          borderRadius: 2,
                          minWidth: 'auto'
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Create New Time Capsule
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Message"
            multiline
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            sx={{ mb: 2 }}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Unlock Date"
              value={formData.unlockDate}
              onChange={(newValue) => setFormData({ ...formData, unlockDate: newValue })}
              minDateTime={new Date(Date.now() + 60 * 60 * 1000)}
              sx={{ width: '100%', mb: 2 }}
            />
          </LocalizationProvider>
          <TextField
            margin="normal"
            fullWidth
            label="Recipient Emails"
            placeholder="Enter email addresses separated by commas"
            value={formData.recipientEmails}
            onChange={(e) => setFormData({ ...formData, recipientEmails: e.target.value })}
            helperText="Leave empty to keep private"
            sx={{ mb: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpen(false)}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCapsule} 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 