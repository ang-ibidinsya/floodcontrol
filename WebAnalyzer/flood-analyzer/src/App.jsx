import { useState } from 'react'
import './App.css'
import {AppHeader} from './components/appHeader';
import { FloodTable } from './components/floodTable';
import {Settings} from './components/settings';
import {createToolTip} from './components/floodTable';

function App() {
  console.log('App render');
  return (
    <>
      {createToolTip('my-tooltip')}
      <AppHeader/>
      <Settings/>
      <FloodTable/>
    </>
  )
}

export default App
