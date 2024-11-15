import { useState } from 'react'
import './App.css'
import {AppHeader} from './components/appHeader';
import { FloodTable } from './components/floodTable';
import {Settings} from './components/settings';

function App() {
  console.log('App render');
  return (
    <>
      <AppHeader/>
      <Settings/>
      <FloodTable/>
    </>
  )
}

export default App
