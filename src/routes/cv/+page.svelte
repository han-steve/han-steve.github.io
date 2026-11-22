<script lang="ts">
	import CompanyMark from '$lib/components/CompanyMark.svelte';
	import { experienceSurface } from '$lib/sheet-navigation';
	import Seo from '$lib/components/Seo.svelte';
	import { talks } from '$lib/projects';
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
				<h3><a use:experienceSurface class="text-link company-link" href="/experience/roblox/"><CompanyMark slug="roblox" /><span data-experience-part="title">Roblox</span></a></h3>
				<span class="cv-date">September 2023 — Present · San Mateo</span>
				<h4 id="agent-infrastructure">Senior Software Engineer · Agent Infrastructure</h4>
				<span class="cv-date">June 2026 — Present</span>
				<p>
					I built the infrastructure for our internal Slack agent and the platform it runs on.
					About 1,000 people use the platform each month.
				</p>
				<p>
					I wrote Temporal workflows to start and stop Kubernetes sandboxes.
					Workspace files stay on EBS when an idle sandbox shuts down.
				</p>
				<h4>Senior Software Engineer · ML Platform</h4>
				<span class="cv-date">August 2025 — June 2026</span>
				<p>
					I split our shared Argo CD deployment by model so teams could release independently.
					I added support for Argo Rollouts and verified under load that switching a running model over didn’t interrupt requests.
				</p>
				<p>
					I managed GPU allocations across fleets totaling more than 10,000 GPUs.
					I enabled RDMA for distributed training on our on-premises GPUs and EFA in AWS.
				</p>
				<p>
					I helped our 3D foundation model researchers process petabytes of data on Ray.
					I built <a class="text-link" href="https://www.youtube.com/watch?v=FhZaVU5-2xE&t=289s">a workspace on the running Ray cluster</a>
					so researchers could test a code change in seconds, down from over ten minutes.
				</p>
				<p>
					I built a Slack agent that checks stuck training jobs and replies in the same thread.
					Engineers have called it 6,400 times.
				</p>
				<h4>Software Engineer · ML Platform</h4>
				<span class="cv-date">September 2023 — August 2025</span>
				<p>
					My teammates and I built the GPU inference clusters for Roblox’s chat filters. I wrote the deployment
					automation we used to bring new production and development clusters online in about 30 minutes.
				</p>
				<p>
					I designed automatic traffic failover and cut the time to add serving capacity from eight minutes to three.
					The new clusters ran larger text filters at half the cost.
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
				<h3><a use:experienceSurface class="text-link company-link" href="/experience/amazon/"><CompanyMark slug="amazon" /><span data-experience-part="title">Amazon</span></a></h3>
				<h4>Software Development Engineer Intern</h4>
				<span class="cv-date">May — August 2021 · May — August 2022 · Seattle</span>
				<p>
					I built a web app for a mentorship program and a Go service that automated more
					than 600 emails people had been sending by hand each quarter.
				</p>
			</div>
			<div class="cv-entry">
				<h3><a use:experienceSurface class="text-link company-link" href="/experience/orca/"><CompanyMark slug="orca" /><span data-experience-part="title">Orca</span></a></h3>
				<h4>Founding Engineer</h4>
				<span class="cv-date">February — July 2022 · Austin</span>
				<p>
					Two friends and I worked on an app that let UT Austin students send money and split bills.
					I built the mobile frontend in React Native and made the website and ads.
				</p>
			</div>
			<div class="cv-entry">
				<h3><a use:experienceSurface class="text-link company-link" href="/experience/dive-chat/"><CompanyMark slug="dive-chat" /><span data-experience-part="title">Dive Chat</span></a></h3>
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
			<p>
				I worked on two of the systems in these articles. I helped build the GPU clusters behind Roblox’s chat filter
				and built the job platform engineers used to run batch inference on Ray.
			</p>
			<ul class="source-list">
				<li>
					<LinkPreview
						href="https://about.roblox.com/newsroom/2025/07/roblox-ai-moderation-massive-scale"
						title="How Roblox Uses AI to Moderate Content on a Massive Scale"
						image="/assets/publications/moderation.webp"
						source="Roblox" date="July 2025"
						description="The filter that checks chat messages for personal information peaked at 370,000 requests per second on the new GPU stack."
					/>
				</li>
				<li>
					<LinkPreview
						href="https://about.roblox.com/newsroom/2024/09/running-ai-inference-at-scale-in-the-hybrid-cloud"
						title="Running AI Inference at Scale in the Hybrid Cloud"
						image="/assets/publications/hybrid-cloud.webp"
						source="Roblox" date="September 2024"
						description="The batch inference section covers why we moved offline workloads to Ray. Engineers could write a single pipeline and let Ray split the work across machines."
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
				During my master’s, I worked on TRILL at the Robot Perception and Learning Lab (RPL). I built the VR system we
				used to record demonstrations for training a humanoid robot to walk and handle objects.
				My thesis was <a class="text-link" href="/projects/trill"
					>VR Teleoperation Interface for Learning Loco-manipulation of Humanoid Robots</a
				>.
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
		Updated November 22, 2026.
	</p>
</div>

<style>
	.company-link {
		--company-mark-size: 28px;
		display: inline-flex;
		align-items: center;
		gap: 10px;
		vertical-align: middle;
	}
	.source-list { list-style: none; padding: 0; margin: .6rem 0 0; display: grid; gap: .2rem; }
	.source-list + h3 { margin-top: 1.75rem; }
</style>
