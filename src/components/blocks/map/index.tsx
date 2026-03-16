import { useEffect, useRef } from "react";
import type { Block } from "@knaw-huc/panoptes-react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Style, Circle, Fill, Stroke } from "ol/style";
import classes from "./MapBlock.module.css";
import "ol/ol.css";

export interface MapBlockConfig {
    zoom?: number;
    tileUrl?: string;
}

export type MapBlockValue = { latitude: number; longitude: number };

export interface MapBlock extends Block {
    type: "map";
    value: MapBlockValue;
    config?: MapBlockConfig;
}

function parseLonLat(value: MapBlockValue): [number, number] | null {
    if (typeof value === "object" && value !== null) {
        if ("longitude" in value && "latitude" in value && value.longitude && value.latitude) {
            return [value.longitude, value.latitude];
        }
    }
    return null;
}

const markerStyle = new Style({
    image: new Circle({
        radius: 7,
        fill: new Fill({ color: "#e53e3e" }),
        stroke: new Stroke({ color: "#fff", width: 2 }),
    }),
});

export default function MapBlockRenderer({ block }: { block: Block }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);

    const { value, config } = block as MapBlock;
    const zoom = config?.zoom ?? 12;

    const lonLat = value != null ? parseLonLat(value) : null;

    useEffect(() => {
        if (!mapRef.current || !lonLat) return;

        const center = fromLonLat(lonLat);

        const markerFeature = new Feature({ geometry: new Point(center) });
        markerFeature.setStyle(markerStyle);

        const vectorSource = new VectorSource({ features: [markerFeature] });

        const tileSource = config?.tileUrl
            ? new OSM({ url: config.tileUrl, attributions: "© OpenStreetMap contributors", crossOrigin: "anonymous" })
            : new OSM({ attributions: "© OpenStreetMap contributors", crossOrigin: "anonymous" });

        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({ source: tileSource }),
                new VectorLayer({ source: vectorSource }),
            ],
            view: new View({ center, zoom }),
            controls: [],
            interactions: [],
        });

        mapInstanceRef.current = map;

        return () => {
            map.setTarget(undefined);
            mapInstanceRef.current = null;
        };
    }, [lonLat, zoom, config?.tileUrl]);

    useEffect(() => {
        if (!mapInstanceRef.current) return;
        mapInstanceRef.current.getView().setZoom(zoom);
    }, [zoom]);

    if (!lonLat) {
        return <span className={classes.empty}>—</span>;
    }

    return <div ref={mapRef} className={classes.map} />;
}
