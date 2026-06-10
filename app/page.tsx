import { Container, Box, Typography } from '@mui/material'
import Image from 'next/image'
import Calculator from '../components/Calculator'

export default function Home() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Image 
          src="/calculator.png" 
          alt="Calculator" 
          width={100} 
          height={100} 
          priority
        />
        <Typography variant="h3" component="h1" sx={{ mb: 2, mt: 2 }}>
          Next.js Calculator
        </Typography>
        <Calculator />
      </Box>
    </Container>
  )
}
