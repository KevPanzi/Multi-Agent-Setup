import { Box, Typography } from '@mui/material'

interface CalculatorDisplayProps {
  value: string
}

export default function CalculatorDisplay({ value }: CalculatorDisplayProps) {
  const displayValue = value === 'Infinity' ? '∞' : value
  
  return (
    <Box
      sx={{ 
        backgroundColor: '#f5f5f5', 
        borderRadius: 1, 
        p: 2, 
        mb: 2,
        textAlign: 'right'
      }}
    >
      <Typography variant="h4" component="div" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
        {displayValue}
      </Typography>
    </Box>
  )
}