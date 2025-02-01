import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Token de Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiYWxiZXJ0c2FsZ3VlZGEiLCJhIjoiY202bWpwZTdsMGY5MTJzc202Y2RsZHVoZCJ9.OeKSI0m7gPwNxLtlio2CfQ';

export function MapboxGlobe() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Inicializar el mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [0, 20],
      zoom: 1.5,
      projection: 'globe',
      renderWorldCopies: false,
      antialias: true // Mejora la calidad visual
    });

    // Configurar efectos atmosféricos
    map.current.on('load', () => {
      map.current?.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });

      // Añadir controles de navegación
      map.current?.addControl(new mapboxgl.NavigationControl());
    });

    // Configurar rotación automática
    let userInteracting = false;
    let spinEnabled = true;

    const spinGlobe = () => {
      if (!map.current || !spinEnabled || userInteracting) return;
      
      const secondsPerRevolution = 120;
      const maxSpinZoom = 5;
      const slowSpinZoom = 3;
      const zoom = map.current.getZoom();
      
      if (zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        
        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        
        const center = map.current.getCenter();
        center.lng -= distancePerSecond / 20;
        map.current.easeTo({ center, duration: 50 });
      }
    };

    const interval = setInterval(spinGlobe, 50);

    // Eventos de interacción
    map.current.on('mousedown', () => {
      userInteracting = true;
    });

    map.current.on('mouseup', () => {
      userInteracting = false;
      setTimeout(() => {
        spinEnabled = true;
      }, 1000);
    });

    map.current.on('dragstart', () => {
      userInteracting = true;
      spinEnabled = false;
    });

    map.current.on('pitchend', () => {
      userInteracting = false;
    });

    map.current.on('rotateend', () => {
      userInteracting = false;
    });

    // Cleanup
    return () => {
      clearInterval(interval);
      map.current?.remove();
    };
  }, []);

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        width: '100%', 
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
        background: 'rgb(11, 11, 25)'
      }} 
    />
  );
}