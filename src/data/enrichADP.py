import json
import re

# File paths
ADP_FILE = 'ADP.json'
PLAYER_FILE = 'players.json'
OUTPUT_FILE = 'adp_enriched.json'

# Fantasy positions
VALID_POSITIONS = {"QB", "WR", "RB", "TE", "DST", "K"}

# DST name-to-abbreviation map
TEAM_NAME_TO_ABBR = {
    "Arizona Cardinals": "ARI", "Atlanta Falcons": "ATL", "Baltimore Ravens": "BAL", "Buffalo Bills": "BUF",
    "Carolina Panthers": "CAR", "Chicago Bears": "CHI", "Cincinnati Bengals": "CIN", "Cleveland Browns": "CLE",
    "Dallas Cowboys": "DAL", "Denver Broncos": "DEN", "Detroit Lions": "DET", "Green Bay Packers": "GB",
    "Houston Texans": "HOU", "Indianapolis Colts": "IND", "Jacksonville Jaguars": "JAX", "Kansas City Chiefs": "KC",
    "Las Vegas Raiders": "LV", "Los Angeles Chargers": "LAC", "Los Angeles Rams": "LAR", "Miami Dolphins": "MIA",
    "Minnesota Vikings": "MIN", "New England Patriots": "NE", "New Orleans Saints": "NO", "New York Giants": "NYG",
    "New York Jets": "NYJ", "Philadelphia Eagles": "PHI", "Pittsburgh Steelers": "PIT", "San Francisco 49ers": "SF",
    "Seattle Seahawks": "SEA", "Tampa Bay Buccaneers": "TB", "Tennessee Titans": "TEN", "Washington Commanders": "WAS"
}

# Load data
with open(ADP_FILE, 'r') as f:
    adp_data = json.load(f)

with open(PLAYER_FILE, 'r') as f:
    player_data = json.load(f)

# Map of espnID -> team
player_map = {str(p['espnID']): p.get('team') for p in player_data['body'] if 'espnID' in p}

# Get the list of players and sort by overallADP to assign integer rankings
adp_list = adp_data['body']['adpList']

# Sort players by overallADP (convert to float for proper sorting)
adp_list.sort(key=lambda x: float(x.get('overallADP', 999)))

# Assign integer rankings (1-based)
for i, player in enumerate(adp_list, 1):
    player['adpRank'] = i

# Extract position and position rank from posADP
for player in adp_list:
    pos_adp = player.get('posADP', '')
    # Extract position (e.g., "WR1" -> "WR")
    pos_match = re.match(r'^([A-Z]+)', pos_adp)
    position = pos_match.group(1) if pos_match and pos_match.group(1) in VALID_POSITIONS else None
    
    # Extract position rank (e.g., "WR1" -> 1, "QB15" -> 15)
    pos_rank_match = re.search(r'(\d+)$', pos_adp)
    pos_rank = int(pos_rank_match.group(1)) if pos_rank_match else None
    
    player['position'] = position
    player['posRank'] = pos_rank

# Enrich ADP players
for player in adp_list:
    name = player.get('longName', 'Unknown')
    player_id = str(player.get('playerID', '')).strip()

    # Default: team = FA
    team = "FA"

    if player_id and player_id in player_map:
        team = player_map[player_id]
    elif name.endswith("DST"):
        # Handle DSTs
        team_name = name.replace(" DST", "")
        team = TEAM_NAME_TO_ABBR.get(team_name, "FA")
        if team == "FA":
            print(f"Unknown DST team for: {name}")
    else:
        print(f"Team not found for: {name} (ID: {player_id})")

    player['team'] = team

    # For DST players, create a playerID based on teamID to make data structure consistent
    if player.get('position') == "DST" and player.get('teamID'):
        player['playerID'] = f"DST_{player['teamID']}"

    if player.get('position') == "DST" and team in TEAM_NAME_TO_ABBR.values():
        # Use team logo for DSTs
        player['headshot'] = f"https://a.espncdn.com/i/teamlogos/nfl/500/{team}.png"
    elif player.get('playerID'):
        player['headshot'] = f"https://a.espncdn.com/i/headshots/nfl/players/full/{player['playerID']}.png"
    else:
        player['headshot'] = f"https://a.espncdn.com/i/headshots/nophoto.png"

# Extract just the enriched player list
enriched_players = adp_list

# Save only the player array to the output file
with open(OUTPUT_FILE, 'w') as f:
    json.dump(enriched_players, f, indent=2)

print(f"\nEnriched ADP player list saved to {OUTPUT_FILE}")
print(f"Total players: {len(enriched_players)}")
print(f"ADP rankings range from 1 to {len(enriched_players)}")

# Print some examples of position rankings
print("\nPosition ranking examples:")
for player in enriched_players[:10]:
    print(f"{player['longName']}: {player['position']}{player['posRank']} (Overall: {player['adpRank']})")