<script lang="ts">
	import CompanyMark from '$lib/components/CompanyMark.svelte';
	import { experienceSurface } from '$lib/sheet-navigation';
	import Seo from '$lib/components/Seo.svelte';
	import { talks, thesisUrl } from '$lib/projects';
	import LinkPreview from '$lib/components/LinkPreview.svelte';
</script>

<Seo
	title="CV — Steve Han"
	description="Steve Han’s work at Roblox and UT Austin, including the Ray Summit talks and research on teaching humanoid robots with VR."
/>
<div class="shell page-top cv-top">
	<h1>CV</h1>
	<a class="button-link primary-link" href="/Steve_Resume.pdf" download>
		<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
			<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" />
		</svg>
		Download resume
	</a>
</div>
<div class="shell">
	<section class="cv-section" aria-labelledby="experience-heading">
		<h2 id="experience-heading">Experience</h2>
		<div>
			<div class="cv-entry">
				<h3><a use:experienceSurface class="company-link" href="/experience/roblox/"><CompanyMark slug="roblox" /><span data-experience-part="title">Roblox</span></a></h3>
				<span class="cv-date">September 2023 — Present · San Mateo</span>
				<h4 id="agent-infrastructure">Senior Software Engineer · Agent Infrastructure</h4>
				<span class="cv-date">June 2026 — Present</span>
				<p>
					I built the Slack integration and Kubernetes infrastructure for our internal agent platform.
					About 1,000 people use it each month. The agent gets tagged about 2,000 times a day in Slack.
				</p>
				<p>
					I integrated agent-sandbox and kept a pool of sandboxes ready so sessions could start in under a second.
					My Temporal workflows shut down idle sandboxes and reattach the workspace on EBS when someone returns to the thread.
				</p>
				<h4>Senior Software Engineer · ML Platform</h4>
				<span class="cv-date">August 2025 — June 2026</span>
				<p>
					I built the training environment our 3D foundation model team used on 96 H200 GPUs in our data center.
					I enabled RDMA between nodes, and the team logged over 50,000 training hours.
				</p>
				<p>
					I helped our 3D foundation model researchers process petabytes of data on Ray.
					I built <a class="text-link" href="https://www.youtube.com/watch?v=FhZaVU5-2xE&t=289s">a workspace on the running Ray cluster</a>
					so researchers could test a code change in seconds, down from over ten minutes.
				</p>
				<p>
					I managed GPU allocations across fleets totaling more than 10,000 GPUs and enabled EFA for distributed training in AWS.
				</p>
				<p>
					I built a Slack agent that checks stuck training jobs and replies in the same thread.
					Engineers have called it 6,400 times.
				</p>
				<h4>Software Engineer · ML Platform</h4>
				<span class="cv-date">September 2023 — August 2025</span>
				<p>
					My teammates and I built a new GPU serving platform for Roblox’s chat filters.
					We could run larger models at half the cost. The filter that checks chat messages for personal information
					handled 370,000 requests per second at peak.
				</p>
				<p>
					I designed and automated cluster provisioning, then brought up our production and development clusters
					in about 30 minutes each. I designed traffic failover and spread model replicas across nodes so we
					could upgrade an entire cluster without taking chat filtering offline.
				</p>
				<p>
					I built our Ray job platform on Kubernetes. We adapted KubeRay to Roblox’s schedulers, and I wrote the
					Go service, authentication, and <a class="text-link" href="https://github.com/kuberay-project/kuberay/pull/3507">job dashboard I later contributed to KubeRay</a>.
					Engineers submitted more than 10,000 Ray jobs in the second quarter of 2025.
				</p>
				<p>
					I helped launch our batch inference API and worked with our 3D researchers to label
					100 million assets on idle GPUs that training jobs could reclaim.
				</p>
			</div>
			<div class="cv-entry">
				<h3><a use:experienceSurface class="company-link" href="/experience/amazon/"><CompanyMark slug="amazon" /><span data-experience-part="title">Amazon</span></a></h3>
				<h4>Software Development Engineer Intern</h4>
				<span class="cv-date">May — August 2021 · May — August 2022 · Seattle</span>
				<p>
					I built a web app for a mentorship program and a Go service that automated more
					than 600 emails people had been sending by hand each quarter.
				</p>
			</div>
			<div class="cv-entry">
				<h3><a use:experienceSurface class="company-link" href="/experience/orca/"><CompanyMark slug="orca" /><span data-experience-part="title">Orca</span></a></h3>
				<h4>Founding Engineer</h4>
				<span class="cv-date">February — July 2022 · Austin</span>
				<p>
					Two friends and I worked on an app that let UT Austin students send money and split bills.
					I built the mobile frontend in React Native and made the website and ads.
				</p>
			</div>
			<div class="cv-entry">
				<h3><a use:experienceSurface class="company-link" href="/experience/dive-chat/"><CompanyMark slug="dive-chat" /><span data-experience-part="title">Dive Chat</span></a></h3>
				<h4>Software Engineer</h4>
				<span class="cv-date">August 2020 — April 2022 · Austin</span>
				<p>I rewrote the group chat web app in React and TypeScript and worked on mobile sign-up.</p>
			</div>
		</div>
	</section>
	<section class="cv-section">
		<h2 id="talks-and-articles">Talks and articles</h2>
		<div class="cv-entry" aria-labelledby="talks-and-articles">
			<h3>Ray Summit</h3>
			<ul class="source-list">
				{#each talks as talk}
					<li><LinkPreview href={talk.url} title={talk.title} image={'/assets/projects/ray-' + talk.year + '.jpg'} source="Ray Summit" date={talk.year} description={talk.description} /></li>
				{/each}
			</ul>
			<h3>Roblox Engineering</h3>
			<ul class="source-list">
				<li>
					<LinkPreview
						href="https://about.roblox.com/newsroom/2025/07/roblox-ai-moderation-massive-scale"
						title="How Roblox Uses AI to Moderate Content on a Massive Scale"
						image="/assets/publications/moderation.webp"
						source="Roblox" date="July 2025"
						description="My teammates and I built the GPU clusters behind Roblox’s chat filters from scratch. I wrote the Terraform and Kubernetes deployment code we used to bring new clusters online in about 30 minutes."
					/>
				</li>
				<li>
					<LinkPreview
						href="https://about.roblox.com/newsroom/2024/09/running-ai-inference-at-scale-in-the-hybrid-cloud"
						title="Running AI Inference at Scale in the Hybrid Cloud"
						image="/assets/publications/hybrid-cloud.webp"
						source="Roblox" date="September 2024"
						description="I wrote the Go service that submits Ray jobs to Kubernetes and built the dashboard engineers use to check their runs. I also helped launch our batch inference API on that platform."
					/>
				</li>
			</ul>
		</div>
	</section>
	<section class="cv-section">
		<h2>Education</h2>
		<div class="cv-entry">
			<h3>University of Texas at Austin</h3>
			<span class="cv-date">August 2019 — May 2023</span>
			<p>B.S. and M.S. in Computer Science<br />B.S.A. in Mathematics<br />Business Spanish Certificate</p>
			<p>Undergraduate GPA 3.99</p>
			<p>
				Built the VR teleoperation system for <a class="text-link" href="/projects/trill/">TRILL</a>
				at the Robot Perception and Learning Lab during master’s research.
			</p>
			<p>
				Master’s thesis · <a class="text-link" href={thesisUrl}>VR Teleoperation Interface for Learning Loco-manipulation of Humanoid Robots</a>
			</p>
		</div>
	</section>
	<section class="cv-section">
		<h2>Awards</h2>
		<div class="cv-entry">
			<p>
				<a class="text-link" href="https://ut-austin-rpl.github.io/TRILL/"
					>TRILL: Whole-Body Control Best Paper Award Finalist</a
				> · IEEE-RAS Humanoids 2023
			</p>
			<p>
				<a class="text-link" href="https://devpost.com/Steve_Han">Winner of seven hackathons</a>
			</p>
			<p>UT Austin Distinguished Honors</p>
			<p><a class="text-link" href="https://www.credly.com/badges/a578df66-4f25-409d-98e4-d99f718d2b65">AWS Certified Developer – Associate</a> · June 2022 – June 2025</p>
		</div>
	</section>
	<section class="cv-section">
		<h2>Skills</h2>
		<div class="cv-entry">
			<p>Go, Python, JavaScript, Java, C++, Rust, HTML, CSS</p>
			<p>Ray, React, PyTorch, Next.js</p>
			<p>Kubernetes, AWS, Kubeflow, Prometheus, Istio, Docker</p>
			<p>English, Chinese, and Spanish</p>
		</div>
	</section>
	<p class="small muted" style="margin-bottom:60px">
		Updated November 23, 2026.
	</p>
</div>

<style>
	.company-link {
		--company-mark-size: 28px;
		display: flex;
		width: fit-content;
		align-items: center;
		gap: .5rem;
		font-weight: 600;
	}
	.cv-entry h3 + h4 { margin-top: 0; }
	.source-list { list-style: none; padding: 0; margin: .6rem 0 0; display: grid; gap: .2rem; }
	.source-list + h3 { margin-top: 1.75rem; }
</style>
