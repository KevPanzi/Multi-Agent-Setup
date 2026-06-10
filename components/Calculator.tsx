"use client"

import { useState } from 'react'
import { Box, Grid, Button, Typography } from '@mui/material'
import CalculatorDisplay from './CalculatorDisplay'
import { calculate, CalculatorState } from '../utils/calculator'

export default function Calculator() {
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
  })

  const handleNumberClick = (number: string) => {
    setState(prev => {
      if (prev.display === '0' || prev.waitingForOperand) {
        return { ...prev, display: number, waitingForOperand: false }
      }
      return { ...prev, display: prev.display + number }
    })
  }

  const handleDecimalClick = () => {
    setState(prev => {
      if (prev.waitingForOperand) {
        return { ...prev, display: '0.', waitingForOperand: false }
      }
      if (!prev.display.includes('.')) {
        return { ...prev, display: prev.display + '.' }
      }
      return prev
    })
  }

  const handleOperationClick = (operation: string) => {
    setState(prev => {
      const result = calculate(prev)
      return {
        display: result.toString(),
        previousValue: result,
        operation: operation,
        waitingForOperand: true,
      }
    })
  }

  const handleEqualsClick = () => {
    setState(prev => {
      const result = calculate(prev)
      return {
        display: result.toString(),
        previousValue: null,
        operation: null,
        waitingForOperand: false,
      }
    })
  }

  const handleClearClick = () => {
    setState({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
    })
  }

  // Negative number handling removed as per requirements

  const result = calculate(state)

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
      <CalculatorDisplay value={state.display} />
      
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid size={3}>
          <Button fullWidth variant="contained" onClick={() => handleOperationClick('+')}>+</Button>
        </Grid>
        <Grid size={3}>
          <Button fullWidth variant="contained" onClick={() => handleOperationClick('-')}>-</Button>
        </Grid>
        <Grid size={3}>
          <Button fullWidth variant="contained" onClick={() => handleOperationClick('*')}>×</Button>
        </Grid>
        <Grid size={3}>
          <Button fullWidth variant="contained" onClick={() => handleOperationClick('/')}>÷</Button>
        </Grid>
        
        {Array.from({ length: 10 }, (_, i) => (
          <Grid key={i} size={3}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => handleNumberClick(i.toString())}
            >
              {i}
            </Button>
          </Grid>
        ))}
        
        <Grid size={3}>
          <Button fullWidth variant="contained" onClick={handleClearClick}>C</Button>
        </Grid>
        <Grid size={3}>
          <Button fullWidth variant="contained" onClick={handleDecimalClick}>.</Button>
        </Grid>
        <Grid size={3}>
          <Button fullWidth variant="contained" onClick={handleEqualsClick}>=</Button>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Result: {result === Infinity ? '∞' : result}
        </Typography>
      </Box>
    </Box>
  )
}
