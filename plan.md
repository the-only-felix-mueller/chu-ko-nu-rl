## Roadmap

- Experiment on the side: Promise that is resolved when *either* a key is pressed or a timer has run out
- Pause-Button: When the player presses "p", enemies shouldn't move, even if it's their turn.
- Aiming and shooting (Enemies die immediately.)
- Examine mode -- Press 'x', move a cursor around the map with arrow keys and print what kind of entity and tile is pointed at. This probably needs a finite state machine system.
- Movement of the player into walls is ignored
- Place enemies randomly on floor tiles
- Enemies follow/charge the player
- Healthpoints for enemies and player
- Field of View
- Animated projetiles ('world' model/logic decides if the bolt misses, UI draws it)
- Animated floor tiles (flowing water, flickering torches?)
- Ammunition is consumed and can be picked up from the floor (How do I indicate when an entity stands on top of items? Blinking? Background-color?)
- Different bolt types (fire, poison, knockback, durable, rope)
- Upgradeable crossbow (magazine size, accuracy, ...)
- Multiple levels
- Custom level generation
- Saving and loading (using localStorage)


## ToDo some time

- Make a sidebar / interface
- Host a playable version of the game on github-pages.
- Address TODO's sprinkled around the code
- Thoroughly test movement system
- Mouse support
