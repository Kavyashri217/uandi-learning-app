import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './styles.css';
import { AppProvider } from './AppState';
import { Layout } from './components/Layout';
import { NeedStudent } from './components/NeedStudent';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Quizzes } from './pages/Quizzes';
import { QuizPlay } from './pages/QuizPlay';
import { GamesHome } from './pages/games/GamesHome';
import { GamePlay } from './pages/games/GamePlay';
import { Progress } from './pages/Progress';
import { Teacher } from './pages/Teacher';

// HashRouter keeps deep links working even when the built app is opened
// straight from the file system (file://…/index.html) on an NGO PC.
const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'library', element: <NeedStudent><Library /></NeedStudent> },
      { path: 'quizzes', element: <NeedStudent><Quizzes /></NeedStudent> },
      { path: 'quizzes/:subject/:klass', element: <NeedStudent><QuizPlay /></NeedStudent> },
      { path: 'quizzes/custom/:id', element: <NeedStudent><QuizPlay /></NeedStudent> },
      { path: 'games', element: <NeedStudent><GamesHome /></NeedStudent> },
      { path: 'games/:gameId', element: <NeedStudent><GamePlay /></NeedStudent> },
      { path: 'progress', element: <NeedStudent><Progress /></NeedStudent> },
      { path: 'teacher', element: <Teacher /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </React.StrictMode>,
);
