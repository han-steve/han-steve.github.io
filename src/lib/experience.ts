export interface ExperienceItem {
	slug: string;
	company: string;
	role: string;
	period: string;
	description: string;
	location: string;
	sections: {
		title?: string;
		body: string | string[];
		figure?: { image: string; alt: string; width: number; height: number; caption: string };
		articles?: { title: string; date: string; url: string }[];
	}[];
	links?: { label: string; url: string }[];
}

export const experience: ExperienceItem[] = [
	{
		slug: 'roblox',
		company: 'Roblox',
		role: 'Senior Software Engineer',
		period: '2023 — present',
		location: 'San Mateo, California',
		description: 'I build infrastructure for our internal Slack agents. My earlier work was on GPU inference clusters and our Ray platform for training and batch jobs.',
		sections: [
			{
				title: 'Agent infrastructure',
				body: [
					'Roblox engineers can tag our internal agent in a Slack thread to run code. I built the Slack integration and Kubernetes clusters for the agent platform. About 1,000 people use it each month, and the agent gets about 2,000 tags a day.',
					'Built our Kubernetes sandbox provider with agent-sandbox and gVisor for code isolation. A pool of ready sandboxes brought startup below one second.',
					'Wrote Temporal workflows to release idle sandboxes and restore the same workspace when a user resumed a Slack session. Workspace files persisted in cloud storage between sessions.',
					'Built a Slack bot that checks stuck training jobs and answers debugging questions from their logs (6,400 invocations).'
				]
			},
			{
				title: 'GPU inference clusters',
				body: [
					'My teammates and I built GPU clusters from scratch to serve machine learning models at Roblox, including the chat filters. I wrote the Terraform and Kubernetes deployment code we used to bring a new cluster online in about 30 minutes.',
					'Designed load balancing and automatic failover, fixed downtime during NGINX redeploys, and spread replicas across nodes so we could upgrade the whole cluster while it served live traffic.',
					'Cut the time to add serving capacity from eight minutes to three by using local NVMe storage.',
					'Our new clusters ran larger chat filters at half the cost. The model that detects personal information in chat handled 370,000 requests per second at peak.'
				],
				articles: [
					{
						title: 'How Roblox Uses AI to Moderate Content on a Massive Scale',
						date: 'July 2025',
						url: 'https://about.roblox.com/newsroom/2025/07/roblox-ai-moderation-massive-scale'
					},
					{
						title: 'The Infrastructure Supporting Record-Breaking Experiences',
						date: 'June 2025',
						url: 'https://about.roblox.com/newsroom/2025/06/roblox-infrastructure-supporting-record-breaking-games'
					}
				]
			},
			{
				title: 'Batch inference and training on Ray',
				body: [
					'Adapted KubeRay to Roblox’s schedulers and built the Go job service and dashboard. The platform handled more than 100 jobs a day.',
					'Enabled RDMA between on-premises training nodes and EFA on AWS. The 3D foundation model team used Ray to process petabytes of data.',
					'Built a cloud IDE by integrating Coder with Ray. The workspace ran on the Ray head node, so researchers could keep their editor open while idle GPU workers scaled to zero.',
					'Used Seekable OCI (SOCI) to load container image data on demand. New development workspaces started six times faster.'
				],
				articles: [{
					title: 'Running AI Inference at Scale in the Hybrid Cloud',
					date: 'September 2024',
					url: 'https://about.roblox.com/newsroom/2024/09/running-ai-inference-at-scale-in-the-hybrid-cloud'
				}]
			},
			{
				title: 'Labeling 3D assets on idle GPUs',
				body: [
					'Managed GPU allocations across shared Kubernetes nodes.',
					'Used spare GPUs to label 100 million assets for a 3D foundation model. Labeling jobs could pause when training reclaimed the GPUs and resume later.'
				]
			}
		],
		links: [
			{ label: 'Ray Summit 2025: training 3D foundation models', url: 'https://www.youtube.com/watch?v=FhZaVU5-2xE' },
			{ label: 'Ray Summit 2024: batch inference', url: 'https://www.youtube.com/watch?v=BN1CVDZjQRE' },
			{ label: 'My dashboard contribution to KubeRay', url: 'https://github.com/kuberay-project/kuberay/pull/3507' }
		]
	},
	{
		slug: 'amazon',
		company: 'Amazon',
		role: 'Software Development Engineer Intern',
		period: 'Summers 2021 & 2022',
		location: 'Seattle, Washington',
		description: 'I built a web app used by more than 200 Amazon leaders in a mentorship program and automated the emails staff sent by hand every quarter.',
		sections: [
			{
				body: 'Over two summer internships, I built a mentorship app for more than 200 Amazon leaders. I wrote the frontend in React, stored program data in DynamoDB and deployed the app with AWS CDK.'
			},
			{
				body: 'Staff were sending more than 600 emails by hand every quarter. I wrote a Go service that queued the messages in SQS and sent them through SES.'
			}
		]
	},
	{
		slug: 'orca',
		company: 'Orca',
		role: 'Founding Engineer',
		period: 'February — July 2022',
		location: 'Austin, Texas',
		description: 'A payments app for UT Austin students. I built the mobile app and launch site.',
		sections: [
			{
				body: 'Orca was a payments app for UT Austin students to send money and split bills. I worked with two friends as a founding engineer and built the mobile app in React Native. We were in Y Combinator’s Winter 2022 batch.',
				figure: {
					image: '/assets/experience/orca-bill-splitting.png',
					alt: 'Orca’s group expense screen lists shared trip costs and shows who has paid.',
					width: 512,
					height: 1008,
					caption: 'In our app, friends could split gas and Airbnb costs in one thread and see who still owed money.'
				}
			},
			{
				body: 'I built our launch site and made our campus ads. We used a Gong Cha deal to show students how cash back worked.'
			}
		]
	},
	{
		slug: 'dive-chat',
		company: 'Dive Chat',
		role: 'Software Engineer',
		period: 'August 2020 — April 2022',
		location: 'Austin, Texas',
		description: 'Group chats and a shared event calendar for college organizations. I rewrote the web app and worked on mobile sign-up.',
		sections: [
			{
				body: 'Dive was an event planning and chat app for college groups. Each group had chat channels and a calendar where members could RSVP to events. I rewrote the web app in React and TypeScript, using Redux and Firebase.',
				figure: {
					image: '/assets/experience/dive-calendar.webp',
					alt: 'Dive’s mobile Events screen has RSVP filters and illustrated cards for a drive-in movie and a hike.',
					width: 496,
					height: 644,
					caption: 'The Events tab let you switch between events you were going to and ones you were hosting.'
				}
			},
			{
				body: 'I worked with our designers on mobile sign-up and connected the new screens to Firebase.'
			}
		]
	}
];
