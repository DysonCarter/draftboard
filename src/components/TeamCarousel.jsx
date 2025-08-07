import React, { useMemo, useRef, useEffect, useState } from 'react';
import { getTeamColorStyle, getPositionColorStyle } from '../utils/colors';

function TeamCarousel({ players, draftSettings }) {
  // Ref for scrollable container
  const scrollRef = useRef(null);
  
  // State to track scroll direction (1 for forward, -1 for backward)
  const [scrollDirection, setScrollDirection] = useState(1);

  // Calculate total roster spots based on draft settings
  const totalRosterSpots = useMemo(() => {
    if (!draftSettings) return 15; // default fallback
    return (
      draftSettings.qbCount +
      draftSettings.rbCount +
      draftSettings.wrCount +
      draftSettings.teCount +
      draftSettings.flexCount +
      draftSettings.kCount +
      draftSettings.dstCount +
      draftSettings.benchCount
    );
  }, [draftSettings]);

  // Get drafted players by you
  const draftedPlayers = useMemo(() => players.filter(player => player.draftedByYou), [players]);

  // Create position-based roster slots
  const rosterSlots = useMemo(() => {
    if (!draftSettings) return [];

    const slots = [];
    const positionGroups = [
      { position: 'QB', count: draftSettings.qbCount },
      { position: 'RB', count: draftSettings.rbCount },
      { position: 'WR', count: draftSettings.wrCount },
      { position: 'TE', count: draftSettings.teCount },
      { position: 'FLEX', count: draftSettings.flexCount },
      { position: 'K', count: draftSettings.kCount },
      { position: 'DST', count: draftSettings.dstCount },
      { position: 'BENCH', count: draftSettings.benchCount }
    ];

    positionGroups.forEach(group => {
      if (group.count > 0) {
        let playersForPosition;
        if (group.position === 'FLEX') {
          playersForPosition = draftedPlayers.filter(player => 
            ['RB', 'WR', 'TE'].includes(player.position) && !player.assigned
          );
        } else if (group.position === 'BENCH') {
          playersForPosition = draftedPlayers.filter(player => !player.assigned);
        } else {
          playersForPosition = draftedPlayers.filter(player => 
            player.position === group.position && !player.assigned
          );
        }

        for (let i = 0; i < group.count; i++) {
          if (i < playersForPosition.length) {
            playersForPosition[i].assigned = true;
            slots.push({
              type: 'player',
              player: playersForPosition[i],
              slotPosition: group.position,
              slotIndex: i + 1
            });
          } else {
            slots.push({
              type: 'empty',
              id: `${group.position}-${i + 1}`,
              slotPosition: group.position,
              slotIndex: i + 1
            });
          }
        }
      }
    });

    // Reset assigned flags
    draftedPlayers.forEach(player => {
      delete player.assigned;
    });

    return slots;
  }, [draftedPlayers, draftSettings]);

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollSpeed = 1; // pixels per interval
    const intervalMs = 30; // interval in milliseconds

    const scrollInterval = setInterval(() => {
      // Only scroll if overflow exists
      if (scrollContainer.scrollWidth <= scrollContainer.clientWidth) return;

      const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      const currentScrollLeft = scrollContainer.scrollLeft;

      // Check if we've reached the end (going forward)
      if (scrollDirection === 1 && currentScrollLeft >= maxScrollLeft) {
        setScrollDirection(-1); // Reverse direction
      }
      // Check if we've reached the beginning (going backward)
      else if (scrollDirection === -1 && currentScrollLeft <= 0) {
        setScrollDirection(1); // Forward direction
      }

      // Apply scroll movement based on current direction
      scrollContainer.scrollLeft += scrollSpeed * scrollDirection;
    }, intervalMs);

    return () => clearInterval(scrollInterval);
  }, [rosterSlots, scrollDirection]);

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 p-3">
      <div className="mb-2">
        <div className="text-sm text-zinc-400 uppercase tracking-wide font-medium">
          Your Team ({draftedPlayers.length}/{totalRosterSpots})
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide" ref={scrollRef}>
        {rosterSlots.map((slot) => (
          <div
            key={slot.type === 'player' ? slot.player.playerID : slot.id}
            className="flex-shrink-0"
          >
            {slot.type === 'player' ? (
              <PlayerMiniCard
                player={slot.player}
                slotPosition={slot.slotPosition}
              />
            ) : (
              <EmptySlot
                position={slot.slotPosition}
                slotIndex={slot.slotIndex}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerMiniCard({ player, slotPosition }) {
  return (
    <div className="bg-zinc-900 w-32 text-white rounded-lg text-xs flex flex-col select-none relative">
      {slotPosition && slotPosition !== player.position && (
        <div className="absolute top-1 right-1 bg-blue-600 text-white text-[8px] px-1 rounded z-10">
          {slotPosition}
        </div>
      )}
      <div
        className="rounded-t-lg p-2 text-center"
        style={getTeamColorStyle(player.team)}
      >
        <h3 className="truncate font-bold">{player.longName.toUpperCase()}</h3>
      </div>
      <div className="w-full h-20 overflow-hidden">
        <img
          src={player.headshot}
          alt={player.longName}
          draggable="false"
          onError={(e) => {
            e.currentTarget.src = "https://a.espncdn.com/i/headshots/nophoto.png";
          }}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="bg-zinc-950 flex-1 rounded-b-lg p-2">
        <div className="flex justify-between items-center text-[10px]">
          <div className="text-center">
            <div className="text-gray-400">TEAM</div>
            <div className="font-bold">{player.team}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">RANK</div>
            <div>#{player.customRank}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">POS</div>
            <div className="relative">
              <span
                className="font-bold text-white px-1 rounded text-[9px]"
                style={getPositionColorStyle(player.position)}
              >
                {player.position}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptySlot({ position, slotIndex }) {
  return (
    <div className="w-32 h-[140px] bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center text-zinc-600">
      <div className="text-4xl mb-2">+</div>
      <div className="text-xs text-zinc-500 text-center">
        <div className="font-bold">{position}</div>
        {position !== 'BENCH' && <div>#{slotIndex}</div>}
      </div>
    </div>
  );
}

export default TeamCarousel;
