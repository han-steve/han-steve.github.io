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
		paragraphs?: string[];
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

export const thesisUrl = 'https://doi.org/10.26153/tsw/52390';

export const talks = [
	{
		year: '2025',
		title: 'How Roblox Trains 3D Foundation Models with Ray',
		description: 'Demonstrated the Coder workspace built for training on Ray. Researchers could edit code on the head node while idle GPU workers scaled to zero. Co-presented with Liangjun Feng and Yiqing Wang.',
		context: 'Ray Summit · Roblox',
		url: 'https://www.youtube.com/watch?v=FhZaVU5-2xE',
		id: 'FhZaVU5-2xE'
	},
	{
		year: '2024',
		title: 'How Roblox Scaled Machine Learning by Leveraging Ray for Efficient Batch Inference',
		description: 'Benchmarked batch image embedding on Ray against online inference. Overlapping CPU preprocessing with GPU inference cut the cost by 58% in the benchmark. Co-presented with Wei Zeng and Yiqing Wang.',
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
		description: 'Master’s research at UT Austin on teaching a humanoid robot household tasks. Built the VR controls our team used to record demonstrations.',
		image: '/assets/projects/trill.png',
		role: 'Co-author · Master’s thesis · UT Austin',
		tools: ['Imitation learning', 'VR teleoperation', 'Robotics'],
		links: [
			{ label: 'TRILL research site', url: 'https://ut-austin-rpl.github.io/TRILL/' },
			{
				label: 'Master’s thesis · UT Austin',
				url: thesisUrl
			},
			{ label: 'Read thesis (PDF)', url: '/assets/publications/han-vr-teleoperation-thesis.pdf' }
		],
		sections: [
			{
				paragraphs: [
					'For my master’s at UT Austin’s Robot Perception and Learning Lab, I worked on teaching a humanoid robot to do household tasks by imitation. I built the VR interface our team used to demonstrate those tasks and record the training data.',
					'The Quest 2 showed the view from the robot’s stereo cameras. Moving either hand controller moved the corresponding robot hand. We used the same controls in MuJoCo and on the physical robot.',
					'From those demonstrations, the robot learned to take the cap off a spray can and put a tool back in its box.'
				]
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
		description: 'A Minecraft-style game for the Quest 2, made with Grace Liu for our computer graphics final at UT Austin.',
		image: '/assets/projects/voxcraft.png',
		role: 'UT Austin computer graphics final, with Grace Liu',
		tools: ['A-Frame', 'JavaScript', 'WebXR'],
		links: [
			{ label: 'Source code', url: 'https://github.com/han-steve/VoxCraft-VR' },
			{ label: 'Watch gameplay', url: 'https://www.youtube.com/watch?v=OoZKp4ltCj0' }
		],
		sections: [
			{
				paragraphs: [
					'Grace Liu and I wanted to see how Minecraft would play on the Quest 2. We made VoxCraft for our computer graphics final at UT Austin using A-Frame and WebXR.'
				],
				features: [
					{
						name: 'Terrain',
						detail: 'The renderer draws only the exposed faces in each 32 × 32 × 32 chunk. It keeps a 5 × 5 grid of chunks around the player. If you leave an area and come back, your edits are still there.',
						demos: [{ gif: '/assets/projects/voxcraft/voxel-mesh.gif', label: 'Voxel mesh', alt: 'The voxel mesh around the player in the block world.', size: 180 }]
					},
					{ name: 'Terrain generation', detail: 'We used Perlin noise to generate hills that continue across chunk boundaries. The terrain height determines which blocks fill each column.' },
					{
						name: 'Movement',
						detail: 'Press B to switch between creative and survival modes. In creative mode you can fly. In survival mode you walk, and your character steps up one-block ledges automatically.',
						demos: [{ gif: '/assets/projects/voxcraft/walking.gif', label: 'Walking', alt: 'First-person view of the player walking through the terrain.', size: 180 }]
					},
					{
						name: 'Building and mining',
						detail: 'Point at a face and pull the trigger to place a block against it. Swing the controller a few times to mine a block, or equip the pickaxe from the inventory to mine it almost instantly.',
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
		description: 'Trained a riderless scooter in MuJoCo to balance, steer and follow a sequence of waypoints.',
		image: '/assets/projects/scooter-model.png',
		role: 'Reinforcement learning final project at UT Austin',
		tools: ['MuJoCo', 'Python', 'Gym', 'Stable Baselines3'],
		links: [
			{ label: 'Watch the demo', url: 'https://www.youtube.com/watch?v=sbeGKYIU3LI' },
			{ label: 'Source code', url: 'https://github.com/han-steve/self-steering-scooter' }
		],
		sections: [
			{
				paragraphs: [
					'Could a rental scooter steer itself back to a charger? I modeled a riderless scooter in MuJoCo and trained it to balance at about 12 mph. I tried two reinforcement learning algorithms on the same task, Proximal Policy Optimization (PPO) and a deep Q-network (DQN).',
					'The controller adjusted the handlebars 30 times a second using the scooter’s tilt, how fast it was tipping, and the steering angle. It earned one point for each step the scooter stayed upright. PPO learned to balance in fewer steps in my runs, so I used it for steering toward a target.'
				],
				figure: {
					image: '/assets/projects/scooter/balance.jpg',
					alt: 'Side-by-side replays of the scooter balancing before and after training',
					width: 640,
					height: 240,
					caption: 'My scooter fell over in half a second before training. On the right is the same test after 72,000 training steps.',
					replay: {
						webm: '/assets/projects/scooter/balance.webm',
						mp4: '/assets/projects/scooter/balance.mp4'
					}
				}
			},
			{
				paragraphs: [
					'To steer toward a target, the controller also needed to know how far left or right to turn. I added that angle to its inputs and penalized it for pointing away from the target. It learned a 90-degree turn first, then a U-turn. After that I trained it from random starting directions.'
				],
				figure: {
					image: '/assets/projects/scooter/trajectories.webp',
					alt: 'Overlaid scooter paths from the origin to a red target 50 meters to the left. One green path veers off to the lower right.',
					width: 1400,
					height: 788,
					caption: 'Each line shows a run with the scooter facing a different direction at the start. The red dot is the target. The green path at the bottom right missed it.'
				}
			},
			{
				paragraphs: [
					'Once the scooter could steer to a single target, I gave it a new waypoint each time it reached one. It rode the whole route without stopping.'
				],
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
		description: 'Motorized two apartment blinds with an ESP32, 3D-printed spools and Apple HomeKit.',
		image: '/assets/projects/sunrise-hardware.png',
		role: 'Personal hardware project',
		tools: ['ESP32', 'HomeSpan', 'HomeKit'],
		links: [
			{ label: 'Watch the build', url: 'https://www.youtube.com/watch?v=UmA7IK7rC7k' },
			{ label: 'Source code', url: 'https://github.com/han-steve/ProjectSunrise' }
		],
		sections: [
			{
				paragraphs: [
					'I wanted to wake up to sunlight in my college apartment. I fitted motors to the blinds on both windows so I could open them in the morning with Apple Home.',
					'My first spool was an empty ibuprofen bottle with a shoelace wound around it. The motor stalled. A bottle cap and some thread from the sewing kit my mom insisted I take to college worked better. The smaller spool gave the motor enough pull to lift the blind, but the thread kept slipping off, so I designed a spool in Fusion 360.'
				],
				figure: {
					image: '/assets/projects/field-notes/sunrise-spool.webp',
					alt: 'Two blind cords wind onto separate tracks of a blue printed spool attached to a motor.',
					width: 950,
					height: 702,
					caption: 'I printed a groove for each cord so they wouldn’t wind over each other.'
				}
			},
			{
				paragraphs: [
					'I was renting, so I printed clamps to mount one motor on my bed frame and the other on the piano stand. The larger blind needed a separate 12-volt supply. An ESP32 running HomeSpan let me set either blind in 10% increments from Apple Home.'
				]
			}
		],
		videos: [
			{
				id: 'UmA7IK7rC7k',
				title: 'DIY HomeKit-Enabled Smart Blinds with ESP32',
				poster: '/assets/projects/sunrise-circuit-board.jpg',
			}
		]
	}
];

export const hackathons = [
 { title: 'Swiper Go Swiping', year: '2021', description: 'An airport check-in kiosk passengers could control with hand gestures. I connected the Electron interface to OpenCV hand tracking.', event: 'TAMUhack', award: 'Third place · Best UI/UX', url: 'https://devpost.com/software/swipergoswiping' },
 { title: 'EquiTeach', year: '2021', description: 'A tutoring app that generated practice quizzes from the transcript of each student’s session.', event: 'HackDFW', award: 'Three sponsor prizes', url: 'https://devpost.com/software/equiteach' },
 { title: 'Haven', year: '2020', description: 'A prototype for finding temporary housing. Hosts could list an empty apartment, and people who needed a place to stay could apply.', event: 'HackTX', award: 'Azure Champ Prize', url: 'https://devpost.com/software/haven-vjxtpg' },
 { title: 'Rentech', year: '2020', description: 'Built a lending site for students to share spare laptops when classes moved online.', event: 'EarthxHack', award: 'UT Dallas Challenge', url: 'https://devpost.com/software/rentech' }
];
