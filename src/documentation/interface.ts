import { key_shortcut, makeExampleFactory } from "../Documentation";
import { type Editor } from "../main";
import topos_arch from './topos_arch.svg';
import many_universes from './many_universes.svg';

export const software_interface = (application: Editor): string => {
  const makeExample = makeExampleFactory(application);
  return `
# Interface
	
The Topos interface is entirely dedicated to highlight the core concepts at play: _scripts_ and _universes_. By understanding the interface, you will already understand quite a lot about Topos and how to play music with it. Make sure to learn the dedicated keybindings as well and you will fly!
	
<object type="image/svg+xml" data=${topos_arch} style="width: 100%; height: auto; background-color: transparent"></object>


## Scripts

Every Topos session is composed of several small scripts. A set of scripts is called a _universe_. Every script is written using the JavaScript programming language and describes a musical or algorithmic process that takes place over time.
	
- **the global script** (${key_shortcut(
    "Ctrl + G"
  )}): _Evaluated for every clock pulse_. The central piece, acting as the conductor for all the other scripts. You can also jam directly from the global script to test your ideas before pushing them to a separate script. You can also access that script using the ${key_shortcut(
    "F10"
  )} key.
- **the local scripts** (${key_shortcut(
    "Ctrl + L"
  )}): _Evaluated on demand_. Local scripts are used to store anything too complex to sit in the global script. It can be a musical process, a whole section of your composition, a complex controller that you've built for your hardware, etc... You can also switch to one of the local scripts by using the function keys (${key_shortcut(
    "F1"
  )} to ${key_shortcut("F9")}).
- **the init script** (${key_shortcut(
    "Ctrl + I"
  )}): _Evaluated on program load_. Used to set up the software the session to the desired state before playing, for example changing bpm or to initialize global variables (See Functions). You can also access that script using the ${key_shortcut(
    "F11"
  )} key.
- **the note file** (${key_shortcut(
    "Ctrl + N"
  )}): _Not evaluated_. Used to store your thoughts or commentaries about the session you are currently playing. It is nothing more than a scratchpad really!
	

${makeExample(
    "To take the most out of Topos...",
    `// Write your code in multiple scripts. Use all the code buffers!
beat(1) :: script(1)
flip(4) :: beat(.5) :: script(2)
`,
    true
  )}

${makeExample(
    "Script execution can become musical too!",
    `// You can play your scripts... algorithmically.
beat(1) :: script([1,3,5].pick())
flip(4) :: beat([.5, .25].beat(16)) :: script([5,6,7,8].loop($(2)))
`,
    false
  )}


There are some useful functions to help you manage your scripts:

- <ic>copy_script(from: number, to: number)</ic>: copy the content of a script to another.
- <ic>delete_script(index: number)</ic>: clear the content of a script. Warning: this is irreversible! 

## Universes
	
<object type="image/svg+xml" data=${many_universes} style="width: 100%; height: auto; background-color: transparent"></object>


A set of files is called a _universe_. Topos can store several universes and switch immediately from one to another. You can switch between universes by pressing ${key_shortcut(
    "Ctrl + B"
  )}. You can also create a new universe by entering a name that has never been used before. _Universes_ are only referenced by their names. Once a universe is loaded, it is not possible to call any data/code from any other universe.
	
Switching between universes will not stop the transport nor reset the clock. You are switching the context but time keeps flowing. This can be useful to prepare immediate transitions between songs and parts. Think of universes as an algorithmic set of music. All scripts in a given universe are aware about how many times they have been runned already. You can reset that value programatically.
	
You can clear the current universe by pressing the flame button on the top right corner of the interface. This will clear all the scripts and the note file. **Note:** there is no shortcut for clearing a universe. We do not want to loose your work by mistake!

There are some useful functions to help you manage your universes:

- <ic>copy_universe(from: string, to: string)</ic>: copy the content of a universe to another. This is useful to create a backup of your work.
- <ic>delete_universe(name: string)</ic>: delete a universe. Warning: this is irreversible!
	
# Sharing your work
	
**Click on the Topos logo in the top bar**. Your URL will change to something much longer and complex. The same URL will be copied to your clipboard. Send this link to your friends to share the universe you are currently working on with them. 
	
- The imported universe will always get a randomly generated name such as: <ic>random_silly_llama</ic>.
- Topos will automatically fetch and switch to the universe that was sent to you. Your previous universe is still accessible if you switch to it, don't worry!

**Note:** links are currently super long and unsharable! Sorry about that, minifying takes a server and we don't have one yet. We will fix that soon. In the meantime, you can use a service like [tinyurl](https://tinyurl.com/) to shorten your links.
`;
};
