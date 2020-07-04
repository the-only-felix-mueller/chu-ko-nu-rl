## Roadmap

- Place enemies randomly on floor tiles
- Movement of the player into walls is ignored
- Examine mode -- Press 'x', move a cursor around the map with arrow keys and print what kind of entity and tile is pointed at. This probably needs a finite state machine system.
- Aiming and shooting (Enemies die immediately.)
- Enemies follow/charge the player
- Healthpoints for enemies and player
- Field of View
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
- Use standardx style checking. I tried it and it has some rules I'm not yet comfortable with. E.g. it want's indentation by two spaces and a space before parameter lists in function definitions. It also wants to get rid of any unnecessary semicolons. I'll have to make the editor aware of these conventions or maybe change them.