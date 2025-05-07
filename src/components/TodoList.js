import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import axios from 'axios';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ 
    title: '', 
    description: '',
    dueDate: '',
    importance: 'medium'
  });
  const [editingTodo, setEditingTodo] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }, []);

  const fetchTodos = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/todos', getAuthHeaders());
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/todos', newTodo, getAuthHeaders());
      setNewTodo({ title: '', description: '', dueDate: '', importance: 'medium' });
      fetchTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/todos/${id}`, getAuthHeaders());
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/todos/${todo._id}`,
        { completed: !todo.completed },
        getAuthHeaders()
      );
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleEditTodo = async (e) => {
    e.preventDefault();
    console.log('Edit form submitted');
    console.log('Current editingTodo:', editingTodo);

    if (!editingTodo || !editingTodo._id) {
      console.error('No todo selected for editing or missing ID');
      return;
    }

    try {
      console.log('Starting update process...');
      
      const updatedTodo = JSON.parse(JSON.stringify(editingTodo));
      console.log('Todo data to update:', updatedTodo);
      
      const todoData = {
        title: updatedTodo.title,
        description: updatedTodo.description,
        dueDate: updatedTodo.dueDate ? new Date(updatedTodo.dueDate).toISOString() : null,
        importance: updatedTodo.importance,
        completed: updatedTodo.completed
      };
      console.log('Formatted data for API:', todoData);

      console.log('Sending PATCH request...');
      const response = await axios.patch(
        `http://localhost:5000/api/todos/${updatedTodo._id}`,
        todoData,
        getAuthHeaders()
      );
      console.log('Update successful, response:', response.data);

      // Update local state
      setTodos(prevTodos => {
        const updatedTodos = prevTodos.map(todo => 
          todo._id === response.data._id ? response.data : todo
        );
        console.log('Updated todos state:', updatedTodos);
        return updatedTodos;
      });
      
      console.log('Clearing edit form...');
      setEditingTodo(null);
      
    } catch (error) {
      console.error('Update failed:', error);
      if (error.response) {
        console.error('Response error:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request error:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      fetchTodos();
    }
  };

  // Update the edit form initialization
  const handleStartEdit = (todo) => {
    setEditingTodo({
      ...todo,
      dueDate: formatDateForInput(todo.dueDate)
    });
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffbb33';
      case 'low':
        return '#00C851';
      default:
        return '#ffbb33';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Card 
          elevation={3} 
          sx={{ 
            mb: 4,
            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: '#2c3e50',
                mb: 3
              }}
            >
              Add New Todo
            </Typography>
            <form onSubmit={handleAddTodo}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    margin="normal"
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#2c3e50',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    margin="normal"
                    multiline
                    rows={2}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: <EventIcon sx={{ mr: 1, color: '#2c3e50' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Importance</InputLabel>
                    <Select
                      value={newTodo.importance}
                      label="Importance"
                      onChange={(e) => setNewTodo({ ...newTodo, importance: e.target.value })}
                      startAdornment={<PriorityHighIcon sx={{ mr: 1, color: '#2c3e50' }} />}
                    >
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    sx={{ 
                      mt: 2,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
                      }
                    }}
                  >
                    Add Todo
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        <Card 
          elevation={3}
          sx={{
            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: '#2c3e50',
                mb: 3
              }}
            >
              Your Todos
            </Typography>
            <List>
              {todos.map((todo) => (
                <Card
                  key={todo._id}
                  sx={{
                    mb: 2,
                    borderRadius: '12px',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    },
                    borderLeft: `4px solid ${getImportanceColor(todo.importance)}`,
                    opacity: todo.completed ? 0.7 : 1,
                  }}
                >
                  <ListItem
                    sx={{
                      textDecoration: todo.completed ? 'line-through' : 'none',
                    }}
                  >
                    <Checkbox
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo)}
                      sx={{
                        color: getImportanceColor(todo.importance),
                        '&.Mui-checked': {
                          color: getImportanceColor(todo.importance),
                        },
                      }}
                    />
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {todo.title}
                        </Typography>
                      }
                      secondary={
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {todo.description && (
                            <Typography variant="body2" color="text.secondary">
                              {todo.description}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1}>
                            <Chip
                              icon={<EventIcon />}
                              label={todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No date'}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              icon={<PriorityHighIcon />}
                              label={todo.importance}
                              size="small"
                              sx={{
                                backgroundColor: `${getImportanceColor(todo.importance)}20`,
                                color: getImportanceColor(todo.importance),
                                borderColor: getImportanceColor(todo.importance),
                              }}
                            />
                          </Stack>
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleStartEdit(todo)}
                        sx={{
                          color: '#2c3e50',
                          '&:hover': {
                            color: '#2196F3',
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteTodo(todo._id)}
                        sx={{
                          color: '#2c3e50',
                          '&:hover': {
                            color: '#ff4444',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Card>
              ))}
            </List>
          </CardContent>
        </Card>

        {editingTodo && (
          <Card 
            elevation={3} 
            sx={{ 
              mt: 4,
              background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  mb: 3
                }}
              >
                Edit Todo
              </Typography>
              <form onSubmit={handleEditTodo}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={editingTodo.title}
                      onChange={(e) =>
                        setEditingTodo({ ...editingTodo, title: e.target.value })
                      }
                      margin="normal"
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={editingTodo.description}
                      onChange={(e) =>
                        setEditingTodo({ ...editingTodo, description: e.target.value })
                      }
                      margin="normal"
                      multiline
                      rows={2}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Due Date"
                      type="date"
                      value={editingTodo.dueDate}
                      onChange={(e) =>
                        setEditingTodo({ ...editingTodo, dueDate: e.target.value })
                      }
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{
                        startAdornment: <EventIcon sx={{ mr: 1, color: '#2c3e50' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Importance</InputLabel>
                      <Select
                        value={editingTodo.importance}
                        label="Importance"
                        onChange={(e) =>
                          setEditingTodo({ ...editingTodo, importance: e.target.value })
                        }
                        startAdornment={<PriorityHighIcon sx={{ mr: 1, color: '#2c3e50' }} />}
                      >
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        sx={{ 
                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
                          }
                        }}
                      >
                        Update Todo
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setEditingTodo(null)}
                        sx={{
                          borderColor: '#ff4444',
                          color: '#ff4444',
                          '&:hover': {
                            borderColor: '#ff4444',
                            backgroundColor: '#ff444420',
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default TodoList; 