import { useEffect, useMemo, useRef, useState } from 'react';
import { AdvancedMarker, APILoadingStatus, Map, useApiLoadingStatus, useMap } from '@vis.gl/react-google-maps';
import { Search } from 'lucide-react';
import { DEFAULT_KOREA_CENTER, DEFAULT_KOREA_ZOOM, isMapsConfigured, mapsConfig } from '../config/mapsConfig';
import { MapBounds } from '../model/locationTypes';
import { RoomSummary } from '../../rooms/model/roomTypes';
import { RoomPriceMarker } from './RoomPriceMarker';
import { RoomClusterMarker } from './RoomClusterMarker';
import { RoomMapInfoCard } from './RoomMapInfoCard';

interface RoomResultsMapProps {
  rooms: RoomSummary[];
  selectedId: number | null;
  hoveredId: number | null;
  viewedIds: Set<number>;
  onSelect: (roomId: number | null) => void;
  onHover: (roomId: number | null) => void;
  // 현재 지도 영역으로 검색을 요청합니다. 부모가 이 경계를 검색 파라미터에 넣어 백엔드에 재요청합니다.
  onSearchArea: (bounds: MapBounds) => void;
}

type LocatedRoom = RoomSummary & { latitude: number; longitude: number };

interface Cluster {
  rooms: LocatedRoom[];
  lat: number;
  lng: number;
}

// The d3 tail tip sits 16px from the left edge and 9px below the marker body.
const PRICE_MARKER_ANCHOR: [string, string] = ['16px', 'calc(100% + 9px)'];
// Keep the card arrow above the selected pin so the pin remains visible and clickable.
const INFO_CARD_ANCHOR: [string, string] = ['50%', 'calc(100% + 64px)'];

function hasCoords(room: RoomSummary): room is LocatedRoom {
  return typeof room.latitude === 'number' && typeof room.longitude === 'number';
}

// 현재 줌에서 가까운(약 64px 이내) 숙소들을 묶습니다. n이 작아 단순 그리디로 충분합니다.
function clusterRooms(rooms: LocatedRoom[], zoom: number): Cluster[] {
  const degPerPixel = 360 / (256 * 2 ** zoom);
  const radius = 64 * degPerPixel;
  const clusters: Cluster[] = [];
  const used = new Set<number>();

  for (const room of rooms) {
    if (used.has(room.id)) continue;
    used.add(room.id);
    const group = [room];
    for (const other of rooms) {
      if (used.has(other.id)) continue;
      if (
        Math.abs(other.latitude - room.latitude) < radius &&
        Math.abs(other.longitude - room.longitude) < radius
      ) {
        used.add(other.id);
        group.push(other);
      }
    }
    const lat = group.reduce((sum, item) => sum + item.latitude, 0) / group.length;
    const lng = group.reduce((sum, item) => sum + item.longitude, 0) / group.length;
    clusters.push({ rooms: group, lat, lng });
  }
  return clusters;
}

export function RoomResultsMap(props: RoomResultsMapProps) {
  if (!isMapsConfigured) {
    return (
      <div className="results-map results-map--fallback">
        <span className="muted">지도를 표시하려면 Google Maps 설정이 필요합니다.</span>
      </div>
    );
  }
  return <RoomResultsMapView {...props} />;
}

function RoomResultsMapView({
  rooms,
  selectedId,
  hoveredId,
  viewedIds,
  onSelect,
  onHover,
  onSearchArea,
}: RoomResultsMapProps) {
  const status = useApiLoadingStatus();
  const [zoom, setZoom] = useState(DEFAULT_KOREA_ZOOM);
  const [hasMoved, setHasMoved] = useState(false);
  const latestBounds = useRef<MapBounds | null>(null);
  const cameraMoved = useRef(false);
  const cameraInitialized = useRef(false);

  function searchCurrentArea() {
    const bounds = latestBounds.current;
    if (!bounds) return;

    // 현재 보이는 영역의 경계를 부모로 올려보내 백엔드에 bbox 검색을 재요청합니다.
    onSearchArea(bounds);
    onSelect(null);
    setHasMoved(false);
  }

  function handleIdle() {
    if (!cameraInitialized.current) {
      cameraInitialized.current = true;
      cameraMoved.current = false;
      return;
    }
    if (!cameraMoved.current) return;

    cameraMoved.current = false;
    setHasMoved(true);
  }

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="results-map results-map--fallback">
        <span className="muted">지도를 불러오지 못했습니다.</span>
      </div>
    );
  }

  return (
    <div className="results-map">
      <Map
        defaultCenter={DEFAULT_KOREA_CENTER}
        defaultZoom={DEFAULT_KOREA_ZOOM}
        mapId={mapsConfig.mapId || undefined}
        gestureHandling="greedy"
        clickableIcons={false}
        mapTypeControl={false}
        reuseMaps
        onCameraChanged={(event) => {
          latestBounds.current = event.detail.bounds;
          setZoom(Math.round(event.detail.zoom));
        }}
        onDragstart={() => {
          cameraMoved.current = true;
        }}
        onZoomChanged={() => {
          if (cameraInitialized.current) cameraMoved.current = true;
        }}
        onIdle={handleIdle}
        onClick={() => onSelect(null)}
      >
        <MapContent
          rooms={rooms}
          zoom={zoom}
          selectedId={selectedId}
          hoveredId={hoveredId}
          viewedIds={viewedIds}
          onSelect={onSelect}
          onHover={onHover}
        />
      </Map>
      {hasMoved ? (
        <button type="button" className="search-here" onClick={searchCurrentArea}>
          <Search size={16} aria-hidden="true" />
          이 지역 검색
        </button>
      ) : null}
    </div>
  );
}

interface MapContentProps extends Omit<RoomResultsMapProps, 'onSearchArea'> {
  zoom: number;
}

function MapContent({ rooms, zoom, selectedId, hoveredId, viewedIds, onSelect, onHover }: MapContentProps) {
  const map = useMap();
  const located = useMemo(() => rooms.filter(hasCoords), [rooms]);
  const points = useMemo(() => located.map((room) => ({ lat: room.latitude, lng: room.longitude })), [located]);
  const clusters = useMemo(() => clusterRooms(located, zoom), [located, zoom]);

  // 검색 결과가 바뀔 때만 지도 영역을 결과 전체에 맞춥니다.
  useEffect(() => {
    if (!map || points.length === 0) {
      return;
    }
    if (points.length === 1) {
      map.setCenter(points[0]);
      map.setZoom(14);
      return;
    }
    const lats = points.map((point) => point.lat);
    const lngs = points.map((point) => point.lng);
    map.fitBounds(
      { north: Math.max(...lats), south: Math.min(...lats), east: Math.max(...lngs), west: Math.min(...lngs) },
      80,
    );
  }, [map, points]);

  const selectedRoom = located.find((room) => room.id === selectedId) ?? null;
  const selectedIsSingle =
    selectedRoom != null && clusters.some((c) => c.rooms.length === 1 && c.rooms[0].id === selectedRoom.id);

  function zoomIntoCluster(cluster: Cluster) {
    if (!map) return;
    map.panTo({ lat: cluster.lat, lng: cluster.lng });
    map.setZoom(Math.min((map.getZoom() ?? zoom) + 2, 17));
  }

  return (
    <>
      {clusters.map((cluster) => {
        if (cluster.rooms.length === 1) {
          const room = cluster.rooms[0];
          return (
            <AdvancedMarker
              key={room.id}
              position={{ lat: room.latitude, lng: room.longitude }}
              anchorPoint={PRICE_MARKER_ANCHOR}
              zIndex={room.id === selectedId ? 60 : room.id === hoveredId ? 20 : 10}
              onClick={() => onSelect(room.id)}
            >
              <div onMouseEnter={() => onHover(room.id)} onMouseLeave={() => onHover(null)}>
                <RoomPriceMarker
                  price={room.pricePerNight}
                  available={room.isAvailable}
                  selected={room.id === selectedId}
                  hovered={room.id === hoveredId}
                  viewed={viewedIds.has(room.id)}
                  rating={room.rating}
                />
              </div>
            </AdvancedMarker>
          );
        }

        const prices = cluster.rooms.map((room) => room.pricePerNight);
        return (
          <AdvancedMarker
            key={`cluster-${cluster.rooms.map((room) => room.id).join('-')}`}
            position={{ lat: cluster.lat, lng: cluster.lng }}
            anchorPoint={['50%', '50%']}
            zIndex={40}
            onClick={() => zoomIntoCluster(cluster)}
          >
            <RoomClusterMarker count={cluster.rooms.length} min={Math.min(...prices)} max={Math.max(...prices)} />
          </AdvancedMarker>
        );
      })}

      {selectedRoom && selectedIsSingle ? (
        <AdvancedMarker
          position={{ lat: selectedRoom.latitude, lng: selectedRoom.longitude }}
          anchorPoint={INFO_CARD_ANCHOR}
          zIndex={50}
        >
          <RoomMapInfoCard room={selectedRoom} onClose={() => onSelect(null)} />
        </AdvancedMarker>
      ) : null}
    </>
  );
}
