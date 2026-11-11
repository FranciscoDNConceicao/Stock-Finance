import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Routes } from '@generouted/react-router'
import { queryClient } from './api/queries'
import './style/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Routes />
  </QueryClientProvider>
)
