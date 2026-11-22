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
		source?: { label: string; url: string };
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
					'Built the infrastructure for our internal Slack agent and the platform it runs on. About 1,000 people use the platform each month, with over 10,000 invocations a week.',
					'Wrote Temporal workflows to start and stop Kubernetes sandboxes. Stored workspace files on EBS so users could reopen the same files from their Slack thread.',
					'Built a Slack bot that checks stuck training jobs and answers debugging questions from their logs (6,400 invocations).'
				]
			},
			{
				title: 'GPU clusters for chat safety',
				body: [
					'Helped build the GPU clusters that serve Roblox’s chat filters. The new clusters ran larger text filters at half the cost.',
					'Wrote the automation that brought a new cluster online in about 30 minutes. Designed automatic traffic failover and cut autoscaling time from eight minutes to three.',
					'Split deployments by model in Argo CD so teams could release independently. Verified in load tests that a running model could switch to Argo Rollouts without dropping traffic.'
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
					'Enabled RDMA for distributed training and helped 3D researchers process petabytes of data on Ray.',
					'Connected researchers’ editors to running Ray clusters, cutting the time to test a code change from over ten minutes to seconds.'
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
					'Managed GPU allocations across fleets totaling more than 10,000 GPUs.',
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
		description: 'I built the mobile app and launch site for Orca, where UT Austin students could send money and split bills.',
		sections: [
			{
				body: 'Two high school friends started Orca while I was at UT Austin. I joined as the founding engineer and built the React Native app students used to pay each other and split bills. We were in Y Combinator’s Winter 2022 batch.',
				source: { label: 'Orca’s Y Combinator profile', url: 'https://www.ycombinator.com/companies/orca' }
			},
			{
				body: 'I also built our launch site and made the ads for campus promotions, including the Gong Cha offer below.',
				figure: {
					image: '/assets/experience/orca-campus-offer.webp',
					alt: 'Orca’s phone mockup shows confetti above a Gong Cha offer for 50% cashback.',
					width: 512,
					height: 1040,
					caption: 'A Gong Cha offer as it appeared on Orca’s 2022 landing page.'
				}
			}
		]
	},
	{
		slug: 'dive-chat',
		company: 'Dive Chat',
		role: 'Software Engineer',
		period: 'August 2020 — April 2022',
		location: 'Austin, Texas',
		description: 'I rewrote Dive’s group-chat web client in React and TypeScript and worked on sign-up in the mobile app.',
		sections: [
			{
				body: 'Dive combined group chat and event planning. I rewrote its web client in React and TypeScript using Redux and Firebase.'
			},
			{
				body: 'On mobile, I worked with our designers on the sign-up flow and connected it to Firebase.',
				figure: {
					image: '/assets/experience/dive-calendar.webp',
					alt: 'Dive’s mobile Events screen has RSVP filters and illustrated cards for a drive-in movie and a hike.',
					width: 496,
					height: 644,
					caption: 'The team’s mobile event calendar, pictured on Dive’s 2021 website.'
				}
			}
		]
	}
];
