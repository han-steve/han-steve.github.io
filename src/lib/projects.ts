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
		description: 'With Liangjun Feng and Yiqing Wang. I demoed how our researchers could edit and run training code on a live Ray cluster.',
		context: 'Ray Summit · Roblox',
		url: 'https://www.youtube.com/watch?v=FhZaVU5-2xE',
		id: 'FhZaVU5-2xE'
	},
	{
		year: '2024',
		title: 'How Roblox Scaled Machine Learning by Leveraging Ray for Efficient Batch Inference',
		description: 'With Wei Zeng and Yiqing Wang. We compared the cost of computing image embeddings in batches on Ray with sending the same images through our online service.',
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
				body: 'For my master’s at UT Austin, I built the interface our lab used to record demonstrations for TRILL. We could see through the humanoid’s stereo camera and move its hands with the VR controllers. One camera sent color and the other grayscale, so I paired frames by ID and sent grayscale to both eyes.'
			},
			{
				body: 'Requesting each controller pose from the headset took about 70 ms in simulation. I changed the headset to stream poses continuously, bringing the time to read the latest pose down to about 0.1 ms. On the physical robot, the arm could still lag a fast hand movement by up to a second.',
				figure: {
					image: '/assets/projects/field-notes/trill-hand-targets.webp',
					alt: 'Red and blue arrows mark the requested hand poses beside the robot’s grippers in a simulated kitchen.',
					width: 977,
					height: 868,
					caption: 'The arrows show where the operator’s hands are asking the robot to go.'
				}
			},
			{
				title: 'Imitation learning',
				body: 'We collected 250 demonstrations per task. In ten trials on the real robot, the trained policy removed a spray can cap nine times and put a tool back in its box eight times. Our paper was a finalist for the Whole-Body Control Best Paper Award at Humanoids 2023.'
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
						detail: 'Perlin noise sets the elevation. Each chunk contains 32 × 32 × 32 blocks. We mesh just the exposed faces and draw a 5 × 5 grid of chunks around the player. As you walk, new chunks load and the game remembers your edits to old ones.',
						demos: [{ gif: '/assets/projects/voxcraft/voxel-mesh.gif', label: 'Voxel mesh', alt: 'The voxel mesh around the player in the block world.', size: 180 }]
					},
					{ name: 'Textures and lighting', detail: 'Block textures change with altitude. We scatter trees and lanterns across the terrain and use a shader to draw the sky gradient.' },
					{
						name: 'Movement',
						detail: 'Fly in creative mode or walk in survival mode, where the player collides with solid blocks and automatically jumps up ledges. Press B to switch modes.',
						demos: [{ gif: '/assets/projects/voxcraft/walking.gif', label: 'Walking', alt: 'First-person view of the player walking through the terrain.', size: 180 }]
					},
					{
						name: 'Tools and inventory',
						detail: 'Press A to open the inventory and point at an item to equip it. The right trigger places a block on the selected face. Swinging the controller mines a block, and equipping the pickaxe speeds that up.',
						demos: [
							{ gif: '/assets/projects/voxcraft/building.gif', label: 'Building', alt: 'The player places blocks using the VR controller.', size: 180 },
							{ gif: '/assets/projects/voxcraft/pickaxe.gif', label: 'Pickaxe', alt: 'The player selects and uses the pickaxe.', size: 200 },
							{ gif: '/assets/projects/voxcraft/dig-down.gif', label: 'Digging straight down', alt: 'The player mines the blocks beneath their feet.', size: 180 }
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
				body: 'For my reinforcement learning final, I modeled a scooter traveling at about 12 mph. The policy could turn the handlebars left or right 30 times a second. My first reward gave it a point for every step it stayed upright. It learned to ride in one big circle.',
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
				body: 'To get the scooter to a destination, I gave it the angle to a target 50 meters away. My first version dropped the sign, so left and right looked identical. Once I fixed that, I trained it on 90-degree turns, then U-turns, then random starting directions.',
				figure: {
					image: '/assets/projects/scooter/trajectories.webp',
					alt: 'Overlaid scooter paths from the origin to a red target 50 meters to the left. One green path veers off to the lower right.',
					width: 1400,
					height: 788,
					caption: 'I ran it 200 times with a random starting heading. It got within 4 meters of the red target 199 times. The green line at the bottom right is the one that missed.'
				}
			},
			{
				body: 'For the waypoint demo I gave the scooter a new target each time it reached one. It could follow a route with waypoints 50 to 100 meters apart. With a target too close to turn toward, it sometimes kept circling. The policy only saw the direction to the target.'
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
				body: 'I rented the apartment, so I printed clamps for the bed frame and the piano stand beside the other window. The first piano stand clamp snapped. The second one held.'
			},
			{
				body: 'Powering the motor from the ESP32 kept knocking the board offline. A separate 12-volt supply fixed that and could lift the larger blind. I used HomeSpan to connect the blinds to HomeKit. The repository includes the firmware and the STL files for the mounts and spools.'
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
