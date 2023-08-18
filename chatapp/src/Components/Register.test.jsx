import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios'; // Mocking axios for testing
import RegisterAndLoginForm from './RegisterAndLoginForm';

// Mock axios to simulate successful and failed requests
jest.mock('axios');

describe('RegisterAndLoginForm', () => {
  it('renders correctly', () => {
    render(<RegisterAndLoginForm />);
    
    // Test component rendering
    expect(screen.getByPlaceholderText('username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('password')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('displays error message if username is taken', async () => {
    axios.get.mockResolvedValue({ data: { exists: true } });
    render(<RegisterAndLoginForm />);

    fireEvent.change(screen.getByPlaceholderText('username'), { target: { value: 'takenUsername' } });
    
    await waitFor(() => {
      expect(screen.getByText('Username is already taken.')).toBeInTheDocument();
    });
  });

  it('displays error message if username not found on login', async () => {
    axios.get.mockResolvedValue({ data: { exists: false } });
    render(<RegisterAndLoginForm />);

    fireEvent.change(screen.getByPlaceholderText('username'), { target: { value: 'nonExistentUsername' } });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Username not found. Consider registering.')).toBeInTheDocument();
    });
  });

  it('calls axios.post on form submission and sets user data on successful response', async () => {
    axios.post.mockResolvedValue({ data: { _id: 'userID' } });
    render(<RegisterAndLoginForm />);

    fireEvent.change(screen.getByPlaceholderText('username'), { target: { value: 'newUsername' } });
    fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('register', {
        username: 'newUsername',
        password: 'password123',
      });
      // You can also add assertions related to setting context values
    });
  });
});
