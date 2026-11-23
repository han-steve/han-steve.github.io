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
					'Roblox engineers tag our agent in Slack to run code. I built the Slack integration, including routing messages to the right session, and the Kubernetes clusters where the code runs. About 1,000 people use the platform each month. The agent gets tagged about 2,000 times a day.',
					'I built the sandbox provider with agent-sandbox and gVisor. Keeping a pool ready brought sandbox startup below one second.',
					'My Temporal workflows shut down idle sandboxes. When someone returns to a Slack thread, the workflow attaches their files from cloud storage to a new sandbox.',
					'Built a Slack bot that checks stuck training jobs and answers debugging questions from their logs (6,400 invocations).'
				]
			},
			{
				title: 'GPU inference clusters',
				body: [
					'My teammates and I built Roblox’s GPU inference clusters from scratch. The clusters serve ML workloads, including safety models, in an active-active setup across multiple regions. I wrote the Terraform and Kubernetes code that brought a new cluster online in about 30 minutes.',
					'I designed the load balancing and automatic failover. The AWS Application Load Balancer sent requests directly to NGINX pods, removing a network hop. I fixed downtime during NGINX redeploys and spread replicas across nodes so we could upgrade a cluster while it served traffic.',
					'Cut the time to add serving capacity from eight minutes to three by using local NVMe storage.',
					'The new clusters ran larger safety models at half the cost. One handled 370,000 requests per second at peak.'
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
					'Built the on-premises training environment and enabled RDMA between nodes. Our 3D foundation model team processed petabytes of data with Ray and logged over 50,000 training hours on 96 H200 GPUs. I also enabled EFA on AWS.',
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
