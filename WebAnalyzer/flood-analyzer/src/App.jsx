import { useState } from 'react'
import './App.css'
import {AppHeader} from './components/appHeader';
import { FloodTable } from './components/floodTable';
import {Filters} from './components/filters';

function App() {
  console.log('App render');
  return (
    <>
      <AppHeader/>
      <Filters/>
      <FloodTable/>
    </>
  )
}

export default App
