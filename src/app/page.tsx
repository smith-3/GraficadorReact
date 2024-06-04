'use client'
import React, { useState, useRef, MutableRefObject, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, Title, Tooltip, Legend, LineController, PointElement, LineElement } from 'chart.js';
import { create, all } from 'mathjs';
import Head from 'next/head';
import FunctionList from '../components/FunctionList';
import InputForms from '../components/InputForms';
import { Plot } from '@/types/type';

Chart.register(CategoryScale, LinearScale, Title, Tooltip, Legend, LineController, PointElement, LineElement);

const math = create(all);

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [intervalValue, setIntervalValue] = useState<number>(0.5);
  const [xMin, setXMin] = useState<number>(-10);
  const [xMax, setXMax] = useState<number>(10);
  const [yMin, setYMin] = useState<number>(-10);
  const [yMax, setYMax] = useState<number>(10);
  const [criticalPoints, setCriticalPoints] = useState<Array<{ x: number, y: number, color: string }>>([]);

  const functionInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<Chart<"line">>(null);

  const handleGraph = () => {
    const functionInput = functionInputRef.current?.value.trim();

    if (!functionInput) {
      setError('Error: Debes ingresar una función.');
      return;
    }

    setError(null);

    try {
      math.evaluate('f(x) = ' + functionInput);
      const currentId = plots.length > 0 ? plots[plots.length - 1].id + 1 : 0;
      const color = '#' + ((Math.random() * 0xffffff) << 0).toString(16);
      setPlots([...plots, { id: currentId, formula: functionInput, color }]);
      if (functionInputRef.current) {
        functionInputRef.current.value = '';
      }

      // Calculate critical points
      const derivative = math.derivative(functionInput, 'x').toString();
      const criticalPoints = calculateCriticalPoints(functionInput, derivative, xMin, xMax);
      setCriticalPoints(criticalPoints);

    } catch (error: any) {
      setError(`Error: ${error.message}`);
    }
  };

  const calculateCriticalPoints = (functionInput: string, derivative: string, xMin: number, xMax: number) => {
    const criticalPoints: Array<{ x: number, y: number, color: string }> = [];
    for (let x = xMin; x <= xMax; x += intervalValue) {
      try {
        const y = math.evaluate(derivative, { x });
        if (Math.abs(y) < 1e-5) { // consider it a critical point
          const originalY = math.evaluate(functionInput, { x });
          const color = '#' + ((Math.random() * 0xffffff) << 0).toString(16);
          criticalPoints.push({ x, y: originalY, color });
        }
      } catch (error) {
        console.error(`Error evaluating derivative at x=${x}: ${error}`);
      }
    }
    return criticalPoints;
  };

  const handleEditFormula = (id: number, newFormula: string) => {
    const updatedPlots = plots.map((plot) => (plot.id === id ? { ...plot, formula: newFormula } : plot));
    setPlots(updatedPlots);
  
    // Recalcular los puntos críticos
    try {
      math.evaluate('f(x) = ' + newFormula);
      const derivative = math.derivative(newFormula, 'x').toString();
      const criticalPoints = calculateCriticalPoints(newFormula, derivative, xMin, xMax);
      setCriticalPoints(criticalPoints);
    } catch (error: any) {
      setError(`Error: ${error.message}`);
    }
  };
  
  const handleDeletePlot = (id: number) => {
    const remainingPlots = plots.filter((plot) => plot.id !== id);
    setPlots(remainingPlots);
  };

  const handleColorChange = (id: number) => {
    const updatedPlots = plots.map((plot) => (plot.id === id ? { ...plot, color: handleColor().color } : plot));
    setPlots(updatedPlots);
  };

  const handleColor = () => {
    return { color: '#' + ((Math.random() * 0xffffff) << 0).toString(16) };
  };

  const handleIntervalChange = () => {
    const interval = parseFloat(intervalRef.current?.value || '0.5');
    if (!isNaN(interval) && interval > 0) {
      setIntervalValue(interval);
    }
  };

  const generateData = (formula: string) => {
    const data = [];
    const modifiedFormula = formula.replace(/ln/g, 'log');
    for (let x = xMin; x <= xMax; x += intervalValue) {
      try {
        const scope = { x };
        let y = math.evaluate(modifiedFormula, scope);
        if (!isFinite(y)) {
          throw new Error('Value is not finite');
        }
        data.push({ x, y });
      } catch (error) {
        console.error(`Error evaluating formula at x=${x}: ${error}`);
      }
    }
    return data;
  };

  const generateLabels = () => {
    const labels = [];
    for (let x = xMin; x <= xMax; x += intervalValue) {
      labels.push(x);
    }
    return labels;
  };

  const chartData = {
    labels: generateLabels(),
    datasets: [
      ...plots.map((plot) => ({
        label: plot.formula,
        data: generateData(plot.formula),
        borderColor: plot.color,
        fill: false,
        tension: 0.1,
        pointRadius: 5,
      })),
      {
        label: 'Puntos Críticos',
        data: criticalPoints.map((point) => ({ x: point.x, y: point.y })),
        pointBackgroundColor: criticalPoints.map((point) => point.color),
        pointBorderColor: criticalPoints.map((point) => point.color),
        pointRadius: 7,
        showLine: false,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'X',
        },
        min: xMin, // Límite mínimo del eje X
        max: xMax, // Límite máximo del eje X
      },
      y: {
        title: {
          display: true,
          text: 'Y',
        },
        min: yMin, // Límite mínimo del eje Y
        max: yMax, // Límite máximo del eje Y
      },
    },
    plugins: {
      legend: {
        display: false, // Oculta la leyenda
      },
    },
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (event.buttons !== 1) return; // Solo actúa si se mantiene presionado el botón izquierdo del ratón
    const movementX = event.movementX / 25; // Ajustar la velocidad de desplazamiento
    const movementY = event.movementY / 25; // Ajustar la velocidad de desplazamiento
    setXMin((prev) => Math.round(prev - movementX));
    setXMax((prev) => Math.round(prev - movementX));
    setYMin((prev) => Math.round(prev + movementY));
    setYMax((prev) => Math.round(prev + movementY));
  };

  const handleDownloadImage = () => {
    if (!chartRef.current) return;
    const canvas = chartRef.current.canvas as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    // Crear un nuevo canvas temporal para dibujar el fondo blanco
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Dibujar fondo blanco en el canvas temporal
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Dibujar el contenido del canvas original en el canvas temporal
    tempCtx.drawImage(canvas, 0, 0);

    // Descargar la imagen desde el canvas temporal
    const link = document.createElement('a');
    link.download = 'chart.jpg';
    link.href = tempCanvas.toDataURL('image/jpeg');
    link.click();
  };

  const handleColorChangeCriticalPoint = (index: number) => {
    const newColor = handleColor().color;
    const updatedCriticalPoints = criticalPoints.map((point, i) =>
      i === index ? { ...point, color: newColor } : point
    );
    setCriticalPoints(updatedCriticalPoints);
  };
  


  return (
    <>
      <Head>
        <title>Rocket Simulator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen">
        <aside className="w-1/4 bg-gray-100 p-4 flex flex-col justify-between h-full">
          <div>
            <FunctionList
              plots={plots}
              handleEditFormula={handleEditFormula}
              handleColorChange={handleColorChange}
              handleDeletePlot={handleDeletePlot}
            />
            <InputForms
              functionInputRef={functionInputRef}
              intervalRef={intervalRef}
              handleGraph={handleGraph}
              handleIntervalChange={handleIntervalChange}
              intervalValue={intervalValue}
              setXMin={setXMin}
              setXMax={setXMax}
              setYMin={setYMin}
              setYMax={setYMax}
              xMin={xMin}
              xMax={xMax}
              yMin={yMin}
              yMax={yMax}
            />

<Box>
  <Typography variant="h6" component="div">
    Puntos Críticos:
  </Typography>
  {criticalPoints.length > 0 ? (
    <Box>
      {criticalPoints.map((point, index) => (
        <Paper
          key={index}
          elevation={2}
          sx={{
            padding: '10px',
            margin: '10px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>

            <Typography>
              x: {point.x}, y: {point.y}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => handleColorChangeCriticalPoint(index)} style={{ backgroundColor: point.color, marginLeft: '8px' }}>
            {':3'}
          </Button>
        </Paper>
      ))}
    </Box>
  ) : (
    <Typography>No se encontraron puntos críticos.</Typography>
  )}
</Box>

          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadImage}
            className="mt-auto mx-auto"
          >
            Descargar Imagen
          </Button>
        </aside>
        <section onMouseMove={handleMouseMove} className="flex-1 flex flex-col items-center justify-center bg-gray-200 p-4 rounded-lg shadow-lg">
          <Paper elevation={3} className="w-full h-full p-4 rounded-lg shadow-md bg-white">
            <Typography variant="h6" gutterBottom>
              Gráfico de funciones
            </Typography>
            <Line ref={chartRef as MutableRefObject<any>} data={chartData} options={options} color='#ffffff' height={0} />
          </Paper>
        </section>
      </main>
    </>
  );
}
