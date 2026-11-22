export interface Project {
	slug: string;
	title: string;
	category: string;
	year: string;
	description: string;
	image?: string;
	glyph?: string;
	role: string;
	tools: string[];
	links: { label: string; url: string }[];
	sections: {
		title?: string;
		body?: string;
		features?: {
			name: string;
			detail: string;
			demos?: { gif: string; label: string; alt: string; size: number }[];
		}[];
		figure?: {
			image: string;
			alt: string;
			width: number;
			height: number;
			caption: string;
			replay?: { webm: string; mp4: string };
		};
	}[];
	videos?: {
		id?: string;
		src?: string;
		mp4?: string;
		title: string;
		poster: string;
	}[];
}

export const talks = [
	{
		year: '2025',
		title: 'How Roblox Trains 3D Foundation Models with Ray',
		description: 'With Liangjun Feng and Yiqing Wang. I showed our training workspace running on the head node of a Ray cluster. Researchers could keep their editor open while the GPU workers scaled down to zero.',
		context: 'Ray Summit · Roblox',
		url: 'https://www.youtube.com/watch?v=FhZaVU5-2xE',
		id: 'FhZaVU5-2xE'
	},
	{
		year: '2024',
		title: 'How Roblox Scaled Machine Learning by Leveraging Ray for Efficient Batch Inference',
		description: 'With Wei Zeng and Yiqing Wang. I walked through a CLIP job where CPUs prepared the next batch of images while one GPU processed the last. In our benchmark it cost 58% less than running the same job through our online service.',
		context: 'Ray Summit · Batch inference at Roblox',
		url: 'https://www.youtube.com/watch?v=BN1CVDZjQRE',
		id: 'BN1CVDZjQRE'
	}
];

export const projects: Project[] = [
	{
		slug: 'trill',
		title: 'TRILL',
		category: 'Robotics & research',
		year: '2023',
		description: 'My master’s research at UT Austin on teaching humanoid robots household tasks with demonstrations recorded in VR.',
		image: '/assets/projects/trill.png',
		role: 'Co-author · Master’s thesis · UT Austin',
		tools: ['Imitation learning', 'VR teleoperation', 'Robotics'],
		links: [
			{ label: 'TRILL research site', url: 'https://ut-austin-rpl.github.io/TRILL/' },
			{
				label: 'Master’s thesis',
				url: 'https://repositories.lib.utexas.edu/items/46bdd285-bc26-4728-955e-3d298b27ad0f'
			}
		],
		sections: [
			{
				title: 'VR teleoperation',
				body: 'For my master’s at UT Austin, I built the VR interface our lab used to teach a humanoid robot household tasks. Wearing the headset, you could see through the robot’s stereo cameras and move its hands with your controllers. That’s how we filmed the ramen demo above.'
			},
			{
				body: 'I wrote the interface in C++ so we could use the same headset with our MuJoCo simulation and the real robot. In simulation, asking the headset where your hands were took about 70 milliseconds per round trip. Streaming the poses let the simulator read the latest one in about 0.1 milliseconds.',
				figure: {
					image: '/assets/projects/field-notes/trill-hand-targets.webp',
					alt: 'Red and blue arrows mark the requested hand poses beside the robot’s grippers in a simulated kitchen.',
					width: 977,
					height: 868,
					caption: 'The red and blue arrows show where I’m asking each hand to go. The gap between an arrow and the gripper shows how far the robot still has to move.'
				}
			},
			{
				title: 'Imitation learning',
				body: 'We recorded 250 demonstrations per task and trained policies to repeat them. On the real robot we ran ten trials of each task in a row. The robot took the cap off a spray can nine times and put a tool back in its box eight times.'
			}
		],
		videos: [
			{
				src: '/assets/video/trill-ramen.webm',
				mp4: '/assets/video/trill-ramen.mp4',
				title: 'Making ramen with a VR-controlled humanoid robot',
				poster: '/assets/video/trill-ramen-poster.jpg',
			}
		]
	},
	{
		slug: 'voxcraft-vr',
		title: 'VoxCraft VR',
		category: 'Graphics & interaction',
		year: 'May 2021',
		description: 'A voxel game for the Quest 2, written in JavaScript for our computer graphics final.',
		image: '/assets/projects/voxcraft.png',
		role: 'UT Austin computer graphics final, with Grace Liu',
		tools: ['A-Frame', 'JavaScript', 'WebXR'],
		links: [
			{ label: 'Source code', url: 'https://github.com/han-steve/VoxCraft-VR' },
			{ label: 'Watch gameplay', url: 'https://www.youtube.com/watch?v=OoZKp4ltCj0' }
		],
		sections: [
			{
				features: [
					{
						name: 'Terrain',
						detail: 'We drew only the exposed faces of each 32 × 32 × 32 chunk. A 5 × 5 grid of chunks follows you as you walk. Walk back to a hill you’ve dug into and the hole is still there.',
						demos: [{ gif: '/assets/projects/voxcraft/voxel-mesh.gif', label: 'Voxel mesh', alt: 'The voxel mesh around the player in the block world.', size: 180 }]
					},
					{ name: 'Terrain generation', detail: 'Perlin noise sets the height of the hills. We use the height to choose the block texture and scatter trees and lanterns across the map.' },
					{
						name: 'Movement',
						detail: 'Press B to switch between flying and walking. On foot, you can walk straight up a one-block ledge.',
						demos: [{ gif: '/assets/projects/voxcraft/walking.gif', label: 'Walking', alt: 'First-person view of the player walking through the terrain.', size: 180 }]
					},
					{
						name: 'Building and mining',
						detail: 'Point at a block and the cursor hugs the face you’re aiming at. Pull the trigger to build there. To mine a block by hand, keep swinging at it. Open the inventory with A and equip the pickaxe to get through it almost instantly.',
						demos: [
							{ gif: '/assets/projects/voxcraft/building.gif', label: 'Building', alt: 'The player places blocks using the VR controller.', size: 180 },
							{ gif: '/assets/projects/voxcraft/pickaxe.gif', label: 'Pickaxe', alt: 'The player selects and uses the pickaxe.', size: 200 },
							{ gif: '/assets/projects/voxcraft/dig-down.gif', label: 'Never dig straight down!', alt: 'The player mines the blocks beneath their feet.', size: 180 }
						]
					}
				]
			}
		],
		videos: [
			{
				id: 'OoZKp4ltCj0',
				title: 'VoxCraft VR gameplay',
				poster: '/assets/projects/voxcraft.png',
			}
		]
	},
	{
		slug: 'self-steering-scooter',
		title: 'Self-steering scooter',
		category: 'Reinforcement learning',
		year: 'May 2022',
		description: 'A simulated scooter that learned to balance, steer and follow waypoints in MuJoCo.',
		image: '/assets/projects/scooter-model.png',
		role: 'Reinforcement learning final project at UT Austin',
		tools: ['MuJoCo', 'Python', 'Gym', 'Stable Baselines3'],
		links: [
			{ label: 'Watch the demo', url: 'https://www.youtube.com/watch?v=sbeGKYIU3LI' },
			{ label: 'Source code', url: 'https://github.com/han-steve/self-steering-scooter' }
		],
		sections: [
			{
				body: 'Rental scooters were always lying on the sidewalks around campus. I wondered if one could ride itself back to a charger. For my reinforcement learning final at UT Austin, I built a scooter in MuJoCo and gave the policy control of the handlebars. At 12 mph, with a reward for staying upright, it learned to ride in one big circle.',
				figure: {
					image: '/assets/projects/scooter/balance.jpg',
					alt: 'Side-by-side replays of the scooter balancing before and after training',
					width: 640,
					height: 240,
					caption: 'On the left, the untrained scooter tips over in half a second. On the right, the same task after 72,000 training steps.',
					replay: {
						webm: '/assets/projects/scooter/balance.webm',
						mp4: '/assets/projects/scooter/balance.mp4'
					}
				}
			},
			{
				body: 'I put a target 50 meters away and pointed the scooter in the opposite direction. After days of training it still couldn’t make the U-turn. I started it sideways instead. Once it learned the 90-degree turn, it could learn the U-turn too. Training on just those two turns got it steering toward the target from angles it hadn’t practiced.',
				figure: {
					image: '/assets/projects/scooter/trajectories.webp',
					alt: 'Overlaid scooter paths from the origin to a red target 50 meters to the left. One green path veers off to the lower right.',
					width: 1400,
					height: 788,
					caption: 'After a final round of training with random starting directions, I ran 200 trials with the same target. The scooter got within 4 meters of it 199 times. The green path at the bottom right is the one that missed.'
				}
			},
			{
				body: 'Then I randomized both the starting point and the destination. The same policy reached a target 50 to 100 meters away in all 200 trials. For the final demo I stopped resetting the simulation. Each time the scooter reached a waypoint, I gave it the next one and let it keep riding.',
				figure: {
					image: '/assets/projects/scooter/waypoints.webp',
					alt: 'A continuous path across the simulated floor changes color at each waypoint.',
					width: 1280,
					height: 720,
					caption: 'One uninterrupted ride. Each color is the path to the next waypoint.'
				}
			}
		],
		videos: [
			{
				id: 'sbeGKYIU3LI',
				title: 'Self-Steering Scooter — Reinforcement Learning',
				poster: '/assets/projects/scooter-opening.jpg',
			}
		]
	},
	{
		slug: 'project-sunrise',
		title: 'Project Sunrise',
		category: 'Hardware & home automation',
		year: 'September 2021',
		description: 'Motorized blinds for my college apartment, controlled through Apple HomeKit.',
		image: '/assets/projects/sunrise-hardware.png',
		role: 'Personal hardware project',
		tools: ['ESP32', 'HomeSpan', 'HomeKit'],
		links: [
			{ label: 'Watch the build', url: 'https://www.youtube.com/watch?v=UmA7IK7rC7k' },
			{ label: 'Source code', url: 'https://github.com/han-steve/ProjectSunrise' }
		],
		sections: [
			{
				body: 'I wanted my blinds to open when it was time to get up. My first spool was an ibuprofen bottle with a shoelace threaded through it. The motor stalled. A bottle cap and thread from my mom’s sewing kit gave it enough leverage to lift the blind. When the thread slipped off, I printed a spool with a groove for each cord.',
				figure: {
					image: '/assets/projects/field-notes/sunrise-spool.webp',
					alt: 'Two blind cords wind onto separate tracks of a blue printed spool attached to a motor.',
					width: 950,
					height: 702,
					caption: 'The printed spool gives each cord its own track.'
				}
			},
			{
				body: 'I couldn’t drill into my college apartment, so I mounted one motor to my bed frame and the other to a piano stand. Each needed its own 3D-printed clamp.'
			},
			{
				body: 'The larger blind needed a separate 12-volt supply. I used HomeSpan to put the blinds in Apple Home, where I could choose how far to open them in 10% steps.'
			}
		],
		videos: [
			{
				id: 'UmA7IK7rC7k',
				title: 'DIY HomeKit-Enabled Smart Blinds with ESP32',
				poster: '/assets/projects/sunrise-hardware.png',
			}
		]
	}
];

export const hackathons = [
 { title: 'Swiper Go Swiping', year: '2021', description: 'I wired our Electron check-in screen to the hand tracker so you could swipe through it without touching the kiosk.', event: 'TAMUhack', award: 'Third place · Best UI/UX', url: 'https://devpost.com/software/swipergoswiping' },
 { title: 'EquiTeach', year: '2021', description: 'We recorded tutoring sessions and turned the transcripts into practice questions students could come back to.', event: 'HackDFW', award: 'Three sponsor prizes', url: 'https://devpost.com/software/equiteach' },
 { title: 'Haven', year: '2020', description: 'We prototyped a way to list an empty apartment and let someone apply to stay there using donated housing tokens.', event: 'HackTX', award: 'Azure Champ Prize', url: 'https://devpost.com/software/haven-vjxtpg' },
 { title: 'Rentech', year: '2020', description: 'When classes went online, we built a place for students to lend a spare laptop to someone who needed one.', event: 'EarthxHack', award: 'UT Dallas Challenge', url: 'https://devpost.com/software/rentech' }
];
