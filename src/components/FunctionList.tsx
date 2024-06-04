// components/FunctionList.tsx
import React from 'react';
import { List, ListItem, ListItemText, Button, TextField, Divider, Typography } from '@mui/material';
import { Plot } from '@/types/type';

interface FunctionListProps {
    plots: Plot[];
    handleEditFormula: (id: number, newFormula: string) => void;
    handleColorChange: (id: number) => void;
    handleDeletePlot: (id: number) => void;
}

const FunctionList: React.FC<FunctionListProps> = ({ plots, handleEditFormula, handleColorChange, handleDeletePlot }) => {
    return (
        <>
            <List>
                {plots.map((plot) => (
                    <div key={plot.id}>
                        <ListItem>
                            <ListItemText primary={
                                <TextField
                                    value={plot.formula}
                                    onChange={(e) => handleEditFormula(plot.id, e.target.value)}
                                    variant="outlined"
                                    fullWidth
                                    placeholder="Ej. sin(x), cos(x), ln(x)"
                                    className="mb-2"
                                />
                            } />
                            <Button onClick={() => handleColorChange(plot.id)} style={{ backgroundColor: plot.color, marginLeft: '8px' }}>{':3'}</Button>
                            <Button onClick={() => handleDeletePlot(plot.id)} style={{ marginLeft: '8px' }}>Eliminar</Button>
                        </ListItem>
                        <Divider />
                    </div>
                ))}
            </List>
        </>
    );
};

export default FunctionList;
