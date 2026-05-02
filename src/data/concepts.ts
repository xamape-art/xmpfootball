import type { Concept, Position } from '../types';

export const CONCEPTS: Record<Position, { ofensivo: Concept[]; defensivo: Concept[] }> = {
  delantera: {
    ofensivo: [
      { id: 'del-of-01', label: 'Si vengo es porque voy', description: 'El movimiento de llegada implica continuación hacia el espacio profundo' },
      { id: 'del-of-02', label: 'Dejar correr el balón para superar', description: 'No intervenir para que el balón pase y supere al defensor' },
      { id: 'del-of-03', label: 'Desmarques para provocar arrastres', description: 'Movimiento para atraer a defensores y liberar espacios para compañeras' },
      { id: 'del-of-04', label: 'Juego de espaldas', description: 'Recepción y protección del balón dando la espalda a portería' },
      { id: 'del-of-05', label: 'Pie de apoyo enfocado a portería para finalizar', description: 'Correcta orientación del pie de apoyo al momento de rematar' },
      { id: 'del-of-06', label: 'Desmarque desde segunda altura', description: 'Llegada desde una posición retrasada hacia el área' },
      { id: 'del-of-07', label: 'Generar pasillos', description: 'Separarse del último o alejarse del intervalo para crear líneas de pase que superen la defensa' },
      { id: 'del-of-08', label: 'Atacar espalda de centrales (desmarque)', description: 'Carrera en profundidad por detrás de los centrales rivales' },
      { id: 'del-of-09', label: 'Atacar espalda de centrales en centro lateral', description: 'Movimiento de atacar a la espalda cuando hay un centro desde banda' },
      { id: 'del-of-10', label: 'Desmarque de atrás hacia delante en centro lateral', description: 'Llegada de segunda línea en situaciones de centro lateral' },
      { id: 'del-of-11', label: 'Descolgarse para rematar en segunda altura', description: 'Alejarse del área para llegar con momentum al remate de segunda jugada' },
      { id: 'del-of-12', label: 'Esperar en fuera de juego para activarse', description: 'Gestión del fuera de juego posicional para ganar ventaja cuando el balón va a banda' },
      { id: 'del-of-13', label: 'Utilizar el cuerpo para generar espacio', description: 'Uso físico del cuerpo para proteger el balón o crear distancia con el defensor' },
      { id: 'del-of-14', label: 'Cruzarse por delante del par para ganar posición', description: 'Movimiento cruzado para obtener ventaja posicional sobre el defensor' },
    ],
    defensivo: [
      { id: 'del-def-01', label: 'Fusiones en línea de medios', description: 'Incorporarse a la línea de mediocampistas durante la fase defensiva' },
      { id: 'del-def-02', label: 'Iniciador de presiones', description: 'Ser el primer jugador en iniciar la presión al portador del balón rival' },
      { id: 'del-def-03', label: 'Evitar relaciones hacia atrás al ser superada', description: 'No permitir que el juego cambie de dirección o salga de la zona de presión al ser superada' },
      { id: 'del-def-04', label: 'Acoso a espaldas como jugadora superada', description: 'Perseguir al portador por detrás para acosar y dificultar su juego' },
      { id: 'del-def-05', label: 'Cerrar líneas de pase entre defensoras rivales', description: 'Bloquear con el cuerpo los posibles pases entre jugadoras de la línea defensiva rival' },
    ],
  },
  extremo: {
    ofensivo: [
      { id: 'ext-of-01', label: 'Redondeo', description: 'Movimiento curvilíneo para recibir en posición ventajosa' },
      { id: 'ext-of-02', label: 'Si voy es porque vengo', description: 'La carrera en profundidad implica un movimiento de retorno' },
      { id: 'ext-of-03', label: 'Si vengo es porque voy', description: 'El movimiento de repliegue implica continuación hacia el espacio' },
      { id: 'ext-of-04', label: 'Pared', description: 'Combinación de uno-dos para superar a un defensor' },
      { id: 'ext-of-05', label: 'Recibir en amplitud y jugar dentro de primeras', description: 'Abrir el juego y dar continuidad interior en el primer toque' },
      { id: 'ext-of-06', label: 'Remolque fuera-dentro', description: 'Arrastre del defensor hacia fuera para liberar espacio interior' },
      { id: 'ext-of-07', label: 'Arrancar en máxima amplitud para fijar y recibir dentro', description: 'Posición de salida en la banda para fijar al lateral y recibir en el interior' },
      { id: 'ext-of-08', label: 'Centro sin superar', description: 'Centrar el balón sin necesidad de driblar previamente al defensor' },
      { id: 'ext-of-09', label: 'Atacar espalda del segundo central', description: 'Diagonal hacia el espacio del segundo central' },
      { id: 'ext-of-10', label: 'Recorte hacia atrás para superar', description: 'Cambio de dirección hacia dentro para superar al defensor' },
      { id: 'ext-of-11', label: 'Control con alejada en banda para encarar', description: 'Primer toque que abre la pelota hacia la banda para encarar con ventaja' },
      { id: 'ext-of-12', label: 'Hundir a la defensa para liberar la frontal', description: 'Carrera en profundidad para abrir espacio en zona de frontal de área' },
      { id: 'ext-of-13', label: 'Desmarque por espalda de lateral', description: 'Carrera por detrás del lateral rival' },
      { id: 'ext-of-14', label: 'Desmarque por espalda de lateral en centro lateral', description: 'Carrera profunda al espacio del lateral en situaciones de centro' },
      { id: 'ext-of-15', label: 'Ir a segunda jugada tras peinada', description: 'Llegar al rechace tras un flick de cabeza' },
      { id: 'ext-of-16', label: 'Desmarque fuera-dentro para liberar subida de lateral', description: 'Movimiento hacia interior para crear espacio a la incorporación del lateral propio' },
      { id: 'ext-of-17', label: 'Generar pasillos', description: 'Crear líneas de pase que superen la línea defensiva rival' },
      { id: 'ext-of-18', label: 'Esperar en segunda altura', description: 'Posicionarse retrasada para llegar con velocidad al espacio' },
      { id: 'ext-of-19', label: 'Generar arrastres', description: 'Mover defensores para liberar espacios a compañeras' },
      { id: 'ext-of-20', label: 'Fijar y soltar en el momento exacto del doblar', description: 'Timing para liberarse cuando el defensor es dobladoel rival hace una dobla' },
      { id: 'ext-of-21', label: 'Dejar correr para superar', description: 'No tocar el balón para que pase y supere al defensor' },
    ],
    defensivo: [
      { id: 'ext-def-01', label: 'Defensa de dobladas junto a P2', description: 'Apoyo defensivo junto al lateral en situaciones de doblada' },
      { id: 'ext-def-02', label: 'Fusiones en línea anterior (línea defensiva)', description: 'Incorporarse a la línea defensiva durante repliegues' },
      { id: 'ext-def-03', label: 'Cerrar líneas de pase', description: 'Bloquear con el cuerpo posibles líneas de pase rivales' },
      { id: 'ext-def-04', label: 'Iniciar persecución en repliegue tras ser superada', description: 'Arrancar la persecución inmediata del balón tras ser superada' },
      { id: 'ext-def-05', label: 'Distribución de marcas', description: 'Correcta asignación y comunicación de marcas en transición defensiva' },
      { id: 'ext-def-06', label: 'Defensa de centro desde lado opuesto', description: 'Posicionamiento defensivo ante centros llegando desde la banda contraria' },
      { id: 'ext-def-07', label: 'Cobertura a lateral', description: 'Ayuda defensiva cuando el lateral propio es superado' },
      { id: 'ext-def-08', label: 'Basculación cerrando al pivote rival (lado débil)', description: 'Cerrar al pivote rival siendo la extremo del lado débil en la basculación' },
    ],
  },
};

export function getConcepts(position: Position, phase: 'ofensivo' | 'defensivo'): Concept[] {
  return CONCEPTS[position][phase];
}

export function getConceptById(id: string): Concept | undefined {
  for (const pos of Object.values(CONCEPTS)) {
    for (const phase of Object.values(pos)) {
      const found = phase.find((c: Concept) => c.id === id);
      if (found) return found;
    }
  }
  return undefined;
}
