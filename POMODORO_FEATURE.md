# Pomodoro Timer Feature

## Overview
The Pomodoro Timer is a productivity feature integrated into your todo application that helps you focus on tasks using the Pomodoro Technique. It includes work sessions, breaks, and task integration.

## Features

### 🍅 Core Pomodoro Functionality
- **25-minute work sessions** (customizable)
- **5-minute short breaks** (customizable)
- **15-minute long breaks** (customizable)
- **Automatic session transitions** (optional)
- **Visual progress indicator** with circular timer
- **Audio notifications** when sessions complete

### 🎯 Task Integration
- **Select specific tasks** to work on during focus sessions
- **Task completion** directly from the timer
- **Task progress tracking** within the timer interface
- **Current task display** in the timer and floating indicator

### ⚙️ Customizable Settings
- Work duration (1-60 minutes)
- Short break duration (1-30 minutes)
- Long break duration (1-60 minutes)
- Sessions until long break (2-10 sessions)
- Auto-start breaks toggle
- Auto-start work sessions toggle
- Sound notifications toggle

### 📊 Statistics & Analytics
- Total work sessions completed
- Daily focus time tracking
- Total sessions (work + breaks)
- Automatic daily reset

### 🎨 Visual Design
- **Floating focus indicator** shows current session when running
- **Color-coded progress rings**:
  - Red for work sessions
  - Green for short breaks  
  - Blue for long breaks
- **Responsive design** works on mobile and desktop
- **Dark/light theme support** matches your app theme

## How to Use

### Starting a Session
1. Click the **"Pomodoro"** button in the dashboard header
2. Choose to start with or without a specific task
3. Click the play button to begin your focus session

### Selecting a Task
- Click the target icon instead of play to select a task
- Choose from your incomplete tasks
- The selected task will be displayed during the session
- Mark tasks complete directly from the timer

### Customizing Settings
1. Open the Pomodoro timer
2. Click the settings gear icon
3. Adjust durations and preferences
4. Settings are automatically saved

### Managing Sessions
- **Pause/Resume**: Click the play/pause button
- **Reset**: Click the reset button (only when paused)
- **Skip**: Click skip to move to the next session type

## Technical Implementation

### Components
- `PomodoroTimer.tsx` - Main timer component with UI
- `usePomodoro.ts` - Custom hook managing timer logic and state

### Features
- **Persistent settings** stored in localStorage
- **Daily statistics** with automatic reset
- **Integration with notification system**
- **Optimistic UI updates** for smooth experience
- **Keyboard shortcuts** (ESC to close modal)

### Data Storage
- Settings: localStorage as `pomodoroSettings`
- Statistics: localStorage as `pomodoroStats`
- Integration with existing todo API for task updates

## Best Practices

### Effective Pomodoro Usage
1. **Choose one task** per work session
2. **Eliminate distractions** during focus time
3. **Take breaks seriously** - step away from your work
4. **Review completed sessions** to track productivity

### Task Selection Tips
- Pick tasks that can be completed in 1-4 Pomodoros
- Break large tasks into smaller subtasks
- Use high-priority tasks during peak focus hours

## Future Enhancements
- Daily/weekly productivity reports
- Pomodoro streaks and achievements
- Integration with calendar applications
- Team Pomodoro sessions
- Advanced analytics and insights

---

The Pomodoro Timer seamlessly integrates with your existing todo workflow, helping you maintain focus and achieve better productivity through structured work sessions.
