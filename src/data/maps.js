// Tile Legend:
// 0 = grass (walkable, light green)
// 1 = path/dirt (walkable, sandy brown)
// 2 = tree (solid, dark green circle on green)
// 3 = water (solid, blue with wave lines)
// 4 = house_wall (solid, brown/beige)
// 5 = tall_grass (walkable+encounter, darker green with grass blades)
// 6 = door (walkable+trigger, dark opening on house)
// 7 = roof (solid, red/orange - top of houses)
// 8 = fence (solid, wooden brown)
// 9 = flower (walkable, decorative, with small colored dots)
// 10 = sign (solid but interactable)
// 11 = lab_wall (solid, white/light gray for the Professor's lab)
// 12 = lab_door (walkable+trigger, for lab entrance)

export const PALLET_TOWN = {
  width: 30,
  height: 25,
  data: [
    // Row 0: Dense trees (top boundary)
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    // Row 1: Dense trees with gap for route entrance
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    // Row 2: Route 1 entrance area - tall grass on sides, path center
    [2,2,2,5,5,5,5,5,2,2,2,2,5,5,1,1,5,5,2,2,2,2,5,5,5,5,5,2,2,2],
    // Row 3: More route area
    [2,2,5,5,5,5,5,5,5,2,2,5,5,5,1,1,5,5,5,2,2,5,5,5,5,5,5,5,2,2],
    // Row 4: Route meets town boundary
    [2,2,5,5,5,5,5,5,5,2,2,5,5,0,1,1,0,5,5,2,2,5,5,5,5,5,5,5,2,2],
    // Row 5: Tree line separating route from town, gap for path
    [2,2,2,2,2,2,2,2,2,2,2,2,0,0,1,1,0,0,2,2,2,2,2,2,2,2,2,2,2,2],
    // Row 6: Town area - Hero's house roof (left), Rival's house roof (right)
    [2,0,0,7,7,7,7,7,0,0,0,0,0,0,1,1,0,0,0,7,7,7,7,7,0,0,0,0,0,2],
    // Row 7: Hero's house walls, Rival's house walls
    [2,0,0,4,4,4,4,4,0,0,0,0,0,0,1,1,0,0,0,4,4,4,4,4,0,0,0,0,0,2],
    // Row 8: Hero's house walls + door, Rival's house walls + door
    [2,0,0,4,4,6,4,4,0,0,0,0,0,0,1,1,0,0,0,4,4,6,4,4,0,0,0,0,0,2],
    // Row 9: Area in front of houses, fences, path
    [2,0,0,8,8,1,8,8,0,0,0,0,0,0,1,1,0,0,0,8,8,1,8,8,0,0,0,0,0,2],
    // Row 10: Open area with flowers, main town path
    [2,0,9,9,0,1,0,9,9,0,0,0,0,1,1,1,1,0,0,9,9,1,0,9,9,0,0,0,0,2],
    // Row 11: Main town path continues, sign
    [2,0,0,0,0,1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,1,0,0,0,0,0,0,0,2],
    // Row 12: Path leading to lab, sign near lab
    [2,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0,0,0,10,0,0,0,2],
    // Row 13: Professor Oak's Lab roof
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,2],
    // Row 14: Lab upper walls
    [2,0,0,0,0,0,0,0,0,0,0,0,0,11,11,11,11,11,11,11,0,0,0,0,0,0,0,0,0,2],
    // Row 15: Lab lower walls with door
    [2,0,0,0,0,0,0,0,0,0,0,0,0,11,11,11,12,11,11,11,0,0,0,0,0,0,0,0,0,2],
    // Row 16: Area in front of lab, path
    [2,0,0,9,0,0,0,9,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,9,0,0,9,0,0,2],
    // Row 17: Southern area with grass and path to water
    [2,0,0,0,0,0,0,0,0,0,5,5,0,0,0,0,1,0,0,0,0,5,5,0,0,0,0,0,0,2],
    // Row 18: More grass and path
    [2,0,0,0,0,0,0,0,0,5,5,5,0,0,0,0,1,0,0,0,5,5,5,0,0,0,0,0,0,2],
    // Row 19: Transition to beach/water
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,2],
    // Row 20: Beach/water boundary
    [2,0,0,0,3,3,3,3,3,3,0,0,0,0,1,1,1,0,0,0,0,3,3,3,3,3,3,0,0,2],
    // Row 21: Water
    [2,3,3,3,3,3,3,3,3,3,3,3,0,0,1,1,0,0,3,3,3,3,3,3,3,3,3,3,3,2],
    // Row 22: Water with dock/path
    [2,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,2],
    // Row 23: Dense water (impassable ocean)
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    // Row 24: Dense water
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  ],

  // Spawn in front of Hero's house door
  spawnPoint: { x: 5, y: 9 },

  // Door triggers
  doors: [
    { x: 5,  y: 8,  target: 'IndoorScene', data: { type: 'hero_house' } },
    { x: 21, y: 8,  target: 'IndoorScene', data: { type: 'rival_house' } },
    { x: 16, y: 15, target: 'IndoorScene', data: { type: 'oak_lab' } },
  ],

  // NPC data
  npcs: [
    { x: 10, y: 10, direction: 'down', dialog: ['Welcome to PALLET TOWN!', 'This is a quiet little town.', 'It\'s a Pokemon world out there!'] },
    { x: 25, y: 12, direction: 'left', dialog: ['Prof. Oak\'s Lab is right there!', 'He studies Pokemon for a living.'] },
    { x: 8,  y: 17, direction: 'right', dialog: ['The tall grass is full of wild Pokemon!', 'Be careful if you don\'t have a Pokemon of your own!'] },
  ],
};
