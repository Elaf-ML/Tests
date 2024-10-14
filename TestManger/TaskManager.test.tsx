import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Importing jest-dom matchers for use

// Sample imports for components
import App from '../App';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TaskItem from '../components/TaskItem';
import TaskFilter from '../components/TaskFilter';

// 1. TaskForm Tests
describe('TaskForm Component', () => {
  test('renders task name input and add button', () => {
    render(<TaskForm />);
    const input = screen.getByRole('textbox', { name: /task name/i });
    const addButton = screen.getByRole('button', { name: /add task/i });
    expect(input).toBeInTheDocument(); // Jest-DOM matcher
    expect(addButton).toBeInTheDocument();
  });

  test('simulates adding a task', () => {
    render(<TaskForm />);
    const input = screen.getByRole('textbox', { name: /task name/i });
    const addButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.click(addButton);
    expect(input).toHaveValue(''); // Input should be cleared after submission
  });

  test('renders validation error for empty task', () => {
    render(<TaskForm />);
    const addButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.click(addButton);
    const errorMessage = screen.getByText(/task name cannot be empty/i);
    expect(errorMessage).toBeInTheDocument(); // Jest-DOM matcher
  });
});

// 2. TaskList Tests
describe('TaskList Component', () => {
  const tasks = [
    { id: 1, name: 'Task 1', completed: false },
    { id: 2, name: 'Task 2', completed: true },
  ];

  test('displays all tasks as list items', () => {
    render(<TaskList tasks={tasks} />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(tasks.length);
  });

  test('renders a message when no tasks are available', () => {
    render(<TaskList tasks={[]} />);
    const noTaskMessage = screen.getByText(/no tasks available/i);
    expect(noTaskMessage).toBeInTheDocument();
  });

  test('marks a specific task as completed', () => {
    render(<TaskList tasks={tasks} />);
    const completeButtons = screen.getAllByRole('button', { name: /complete/i });
    fireEvent.click(completeButtons[0]); // Completes Task 1
    const completedTask = screen.getByText(/task 1/i);
    expect(completedTask).toHaveClass('completed'); // Jest-DOM matcher
  });

  test('deletes a specific task', () => {
    render(<TaskList tasks={tasks} />);
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]); // Deletes Task 1
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(tasks.length - 1); // The task list should decrease by 1
  });
});

// 3. TaskItem Tests
describe('TaskItem Component', () => {
  const task = { id: 1, name: 'Test Task', completed: false };

  test('renders the task item', () => {
    render(<TaskItem task={task} />);
    const taskText = screen.getByText(/test task/i);
    expect(taskText).toBeInTheDocument();
  });

  test('renders complete button', () => {
    render(<TaskItem task={task} />);
    const completeButton = screen.getByRole('button', { name: /complete/i });
    expect(completeButton).toBeInTheDocument();
  });

  test('renders delete button', () => {
    render(<TaskItem task={task} />);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
  });

  test('handles task completion', () => {
    const onComplete = jest.fn();
    render(<TaskItem task={task} onComplete={onComplete} />);
    const completeButton = screen.getByRole('button', { name: /complete/i });
    fireEvent.click(completeButton);
    expect(onComplete).toHaveBeenCalledWith(task.id);
  });
});

// 4. TaskFilter Tests
describe('TaskFilter Component', () => {
  test('renders filter dropdown', () => {
    render(<TaskFilter />);
    const filter = screen.getByRole('combobox', { name: /filter tasks/i });
    expect(filter).toBeInTheDocument(); // Jest-DOM matcher
  });

  test('filters tasks by completed status', () => {
    const onFilterChange = jest.fn();
    render(<TaskFilter onFilterChange={onFilterChange} />);
    const filter = screen.getByRole('combobox', { name: /filter tasks/i });
    fireEvent.change(filter, { target: { value: 'Completed' } });
    expect(onFilterChange).toHaveBeenCalledWith('Completed');
  });
});

// 5. App Integration Tests
describe('App Component (Integration)', () => {
  test('adds a task and displays it in the list', () => {
    render(<App />);
    const input = screen.getByRole('textbox', { name: /task name/i });
    const addButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.click(addButton);
    const taskItem = screen.getByText(/new task/i);
    expect(taskItem).toBeInTheDocument();
  });

  test('marks task as completed from TaskList', () => {
    render(<App />);
    const input = screen.getByRole('textbox', { name: /task name/i });
    const addButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.click(addButton);
    const completeButton = screen.getAllByRole('button', { name: /complete/i });
    fireEvent.click(completeButton[0]); // Completes the first added task
    const completedTask = screen.getByText(/new task/i);
    expect(completedTask).toHaveClass('completed'); // Jest-DOM matcher
  });

  test('filters tasks by completed status', () => {
    render(<App />);
    const input = screen.getByRole('textbox', { name: /task name/i });
    const addButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.click(addButton);
    const filter = screen.getByRole('combobox', { name: /filter tasks/i });
    fireEvent.change(filter, { target: { value: 'Completed' } });
    const completedTasks = screen.queryAllByText(/new task/i);
    expect(completedTasks.length).toBeGreaterThan(0);
  });

  test('removes task from TaskList', () => {
    render(<App />);
    const input = screen.getByRole('textbox', { name: /task name/i });
    const addButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.change(input, { target: { value: 'Task to Delete' } });
    fireEvent.click(addButton);
    const deleteButton = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton[0]); // Deletes the first added task
    const taskItem = screen.queryByText(/task to delete/i);
    expect(taskItem).not.toBeInTheDocument(); // Jest-DOM matcher
  });
});
