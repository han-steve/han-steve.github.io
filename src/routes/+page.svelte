<script lang="ts">
	import BubbleChart, { type Technology } from '$lib/components/BubbleChart.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Experience from '$lib/components/Experience.svelte';
	import { projects } from '$lib/projects';
	const featuredProjects = ['trill', 'voxcraft-vr', 'self-steering-scooter', 'project-sunrise']
		.map(slug => projects.find(project => project.slug === slug)!);

	const technologies: Technology[] = [
		{
			name: 'Kubernetes',
			svg: '/assets/icons/kubernets.svg',
			proficiency: 5 as const,
			description:
				'I work on Kubernetes controllers and GPU scheduling for training and inference.',
			type: 'infra'
		},
		{
			name: 'Istio',
			svg: '/assets/icons/istio.svg',
			proficiency: 2 as const,
			description: 'I use Istio to route requests to models and control which services can talk to each other.',
			type: 'infra'
		},
		{
			name: 'AWS',
			svg: '/assets/icons/aws.svg',
			proficiency: 5 as const,
			description:
				'I started with Lambda at Amazon. At Roblox I set up EFA so GPU nodes on AWS could talk to each other during training.',
			type: 'infra',
			padding: 0.4
		},
		{
			name: 'Prometheus',
			svg: '/assets/icons/prometheus.svg',
			proficiency: 2 as const,
			description:
				'I use Prometheus and Grafana to see what our clusters are doing.',
			type: 'infra'
		},
		{
			name: 'ArgoCD',
			svg: '/assets/icons/argocd.svg',
			proficiency: 2 as const,
			description:
				'I use Argo CD to deploy cluster changes from Git and Kargo to roll them out in stages.',
			type: 'infra'
		},
		{
			name: 'Kubeflow',
			svg: '/assets/icons/kubeflow.svg',
			proficiency: 4 as const,
			description: 'I helped keep notebooks, pipelines and model serving running for hundreds of ML engineers.',
			type: 'infra'
		},
		{
			name: 'Docker',
			svg: '/assets/icons/docker.svg',
			proficiency: 3 as const,
			description: 'I built the base images researchers use for training and remote development.',
			type: 'infra'
		},
		{
			name: 'Vim',
			svg: '/assets/icons/vim.svg',
			proficiency: 1.5 as const,
			description: "I'm a terminal warrior whose favorite weapons are neovim, tmux, k9s, and zsh",
			type: 'infra'
		},
		{
			name: 'Svelte',
			svg: '/assets/icons/svelte.svg',
			proficiency: 2 as const,
			description: 'You are looking at Svelte 5 and SvelteKit code right now!',
			type: 'framework'
		},
		{
			name: 'Vue',
			svg: '/assets/icons/vue.svg',
			proficiency: 2 as const,
			description:
				'Vue was my first web framework, and in my Vue it still has the best developer experience',
			type: 'framework'
		},
		{
			name: 'React',
			svg: '/assets/icons/react.svg',
			proficiency: 5 as const,
			description:
				'I used React for the Dive Chat web app and the dashboard I contributed to KubeRay.',
			type: 'framework'
		},
		{
			name: 'Nextjs',
			svg: '/assets/icons/nextjs.svg',
			proficiency: 1.5 as const,
			description: 'I’ve used Next.js with Turbopack.',
			type: 'framework'
		},
		{
			name: 'Expo',
			svg: '/assets/icons/expo.svg',
			proficiency: 3 as const,
			description: 'I use Expo and React Native to build for iOS and Android.',
			type: 'framework',
			padding: 0.4
		},
		{
			name: 'PyTorch',
			svg: '/assets/icons/pytorch.svg',
			proficiency: 3 as const,
			description:
				'I use PyTorch for distributed training and for running models on GPUs.',
			type: 'framework',
			padding: 0.4
		},
		{
			name: 'Ray',
			svg: '/assets/icons/ray.svg',
			proficiency: 5 as const,
			description:
				'Researchers use the Ray job service I wrote for everything from labeling images to training foundation models.',
			type: 'framework',
			padding: 0.4
		},
		{
			name: 'JavaScript',
			svg: '/assets/icons/javascript.svg',
			proficiency: 4 as const,
			description:
				'TypeScript is preferred. Despite loving the "You Don\'t Know JS" books, I do know something about JavaScript',
			type: 'language',
			padding: 0.5
		},
		{
			name: 'HTML&CSS',
			svg: '/assets/icons/htmlcss.svg',
			proficiency: 3 as const,
			description:
				'Can write semantic HTML and responsive CSS without AI. By the way are they programming languages?',
			type: 'language'
		},
		{
			name: 'C++',
			svg: '/assets/icons/cpp.svg',
			proficiency: 2 as const,
			description: 'I reach for C++ for graphics and robotics.',
			type: 'language'
		},
		{
			name: 'Python',
			svg: '/assets/icons/python.svg',
			proficiency: 3 as const,
			description: "If you give me a LeetCode question, I'm doing it in Python",
			type: 'language'
		},
		{
			name: 'Java',
			svg: '/assets/icons/java.svg',
			proficiency: 2 as const,
			description: 'Will use it if I have to (talking about you, Amazon)',
			type: 'language'
		},
		{
			name: 'Go',
			svg: '/assets/icons/go.svg',
			proficiency: 5 as const,
			description:
				'Wrote backends, Kubernetes controllers, and just about everything else in Go because I love it so much',
			type: 'language'
		},
		{
			name: 'Rust',
			svg: '/assets/icons/rust.svg',
			proficiency: 1.5 as const,
			description: 'Succumbed to peer pressure and read the Rust book',
			type: 'language'
		}
	];
</script>

<Seo title="Steve Han" description="I build tools for training models and running agents at Roblox. At UT Austin I worked on imitation learning for humanoid robots." />

<p>
	I’m a software engineer at <a class="link" href="/experience/roblox/"><em>Roblox</em></a>.
	I build the infrastructure for our internal Slack agent and the platform it runs on.
	Before that, I pushed for using Ray to run models over large datasets and wrote the service engineers use to submit jobs and find their logs.
</p>

<p>
	Before Roblox, I spent two summers at <em>Amazon</em> and built the mobile app for
	<a class="link" href="/experience/orca/"><em>Orca</em></a> with two friends. The app let UT Austin students send money and split bills.
	In college I spent a lot of weekends at hackathons and <a class="link" href="/projects/#hackathons-heading">won a few</a>.
</p>

<p class="mb-0">
	I love learning new technologies and understanding how things work from first principles. My
	passion is to use computing to build scalable automations, create delightful interactions, and
	enhance our well-being. To these ends, I've learned the following tools. The sizes are
	proportional to my proficiency. You can poke at them to learn more.
</p>
<div>
	<BubbleChart {technologies} />
</div>

<p>
	I graduated from the <em>University of Texas at Austin</em> with a Masters and a Bachelors in Computer
	Science, a Bachelors in Math, and a certificate in Spanish.
</p>
<p>
	For my master’s, I worked on <a class="link" href="/projects/trill/">TRILL</a> at the Robot Perception and Learning Lab (RPL).
	I built the VR interface we used to record demonstrations for imitation learning. We taught the robot to take the cap off a spray can and put a tool back in its box.
</p>

<Experience />

<section class="section" aria-labelledby="selected-work">
	<div class="section-heading">
		<h2 id="selected-work">Projects</h2>
		<a class="link inline-link" href="/projects">All projects</a>
	</div>
	<div class="project-list">
		{#each featuredProjects as project}<ProjectCard {project} />{/each}
	</div>
</section>
