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
		points?: string[];
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
		description: 'Demonstrated a Ray training workspace that kept the editor open while GPU workers scaled to zero. Co-presented with Liangjun Feng and Yiqing Wang.',
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
		description: 'Built a VR teleoperation system at UT Austin to teach humanoid robots to walk and handle objects from human demonstrations.',
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
				points: [
					'Built the VR interface for TRILL during master’s research at UT Austin. We used imitation learning to teach a humanoid robot to walk and handle objects.',
					'Connected a Quest 2 to MuJoCo and the physical robot. In the ramen demo, an operator guides both hands using the robot’s stereo camera feed.',
					'Co-authored the TRILL paper. After training on 250 demonstrations per task, the robot removed a spray cap in 9 of 10 trials and put a tool back in its box in 8 of 10.'
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
		description: 'Developed a voxel game for the Quest 2 with Grace Liu. Designed an editable world players could mine and build in with hand controllers.',
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
						detail: 'Rendered only the exposed faces of each 32 × 32 × 32 chunk. Kept a 5 × 5 grid around the player and saved edits as chunks left the screen.',
						demos: [{ gif: '/assets/projects/voxcraft/voxel-mesh.gif', label: 'Voxel mesh', alt: 'The voxel mesh around the player in the block world.', size: 180 }]
					},
					{ name: 'Terrain generation', detail: 'Generated hills with Perlin noise, selected block textures by elevation, and scattered trees and lanterns across the map.' },
					{
						name: 'Movement',
						detail: 'Added flight in creative mode and automatic jumps over one-block ledges in survival mode. Press B to switch modes.',
						demos: [{ gif: '/assets/projects/voxcraft/walking.gif', label: 'Walking', alt: 'First-person view of the player walking through the terrain.', size: 180 }]
					},
					{
						name: 'Building and mining',
						detail: 'Mapped building to the trigger and mining to repeated swings at the same block. The cursor hugs the selected face. Equipping the pickaxe from the inventory makes mining almost instant.',
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
				points: [
					'Compared Proximal Policy Optimization (PPO) with a deep Q-network (DQN) to teach a riderless scooter to balance in MuJoCo. Both earned one point per step upright. PPO learned to balance in fewer steps in my runs, so I used it for navigation.',
					'Held the scooter at 12 mph and gave the policy control of the handlebars. Thirty times a second it read the scooter’s lean, how fast it was tipping, and the steering angle, then chose one of five steering adjustments.'
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
				points: [
					'Added the signed angle to the target as an input and penalized heading error. Trained the scooter on a 90-degree turn, then a U-turn, before testing it from new starting directions.'
				],
				figure: {
					image: '/assets/projects/scooter/trajectories.webp',
					alt: 'Overlaid scooter paths from the origin to a red target 50 meters to the left. One green path veers off to the lower right.',
					width: 1400,
					height: 788,
					caption: 'I ran 200 trials with the scooter pointed in a random direction each time. It got within 4 meters of the red target 199 times. The green line at the bottom right is the one that missed.'
				}
			},
			{
				points: [
					'Tested the same policy with random starts and targets 50 to 100 meters away. It reached the target in all 200 trials.',
					'Chained waypoints without resetting the simulation. Each time the scooter reached its destination, it kept riding toward the next one.'
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
				points: [
					'Replaced a stalled ibuprofen-bottle spool and shoelace with a bottle cap and thread from a sewing kit. With the smaller spool, the motor could lift the blind.'
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
				points: [
					'Designed 3D-printed clamps for a bed frame and piano stand to mount both motors without drilling into the apartment.',
					'Powered the larger blind with a separate 12-volt supply. Used HomeSpan to set the opening in 10% steps from Apple Home.'
				]
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
 { title: 'Swiper Go Swiping', year: '2021', description: 'Connected an Electron check-in kiosk to a hand tracker so visitors could swipe through check-in without touching the screen.', event: 'TAMUhack', award: 'Third place · Best UI/UX', url: 'https://devpost.com/software/swipergoswiping' },
 { title: 'EquiTeach', year: '2021', description: 'Turned recorded tutoring sessions into practice questions students could revisit.', event: 'HackDFW', award: 'Three sponsor prizes', url: 'https://devpost.com/software/equiteach' },
 { title: 'Haven', year: '2020', description: 'Prototyped a housing exchange where people could offer an empty apartment and fund a stay with donated tokens.', event: 'HackTX', award: 'Azure Champ Prize', url: 'https://devpost.com/software/haven-vjxtpg' },
 { title: 'Rentech', year: '2020', description: 'Built a lending site for students to share spare laptops when classes moved online.', event: 'EarthxHack', award: 'UT Dallas Challenge', url: 'https://devpost.com/software/rentech' }
];
