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
				<p>Built the Slack integration and Kubernetes infrastructure for an internal agent platform used by about 1,000 people a month. The agent gets tagged about 2,000 times a day in Slack.</p>
				<p>Built a Kubernetes sandbox provider with agent-sandbox and gVisor. Wrote Temporal workflows to release idle sandboxes and reconnect each Slack session to its files in cloud storage.</p>
				<h4>Senior Software Engineer · ML Platform</h4>
				<span class="cv-date">August 2025 — June 2026</span>
				<p>Built the RDMA-enabled training environment where the 3D foundation model team logged over 50,000 training hours on 96 H200 GPUs.</p>
				<p>Integrated Coder with Ray to build a cloud IDE. Researchers could test code changes in seconds instead of waiting over ten minutes for a rebuild. Used Seekable OCI (SOCI) to start new workspaces six times faster.</p>
				<h4>Software Engineer · ML Platform</h4>
				<span class="cv-date">September 2023 — August 2025</span>
				<p>Helped build active-active GPU inference clusters from scratch across multiple regions. Designed load balancing and automatic failover with AWS Application Load Balancers. Automated cluster setup with Terraform and Kubernetes.</p>
				<p>Built the Ray job platform on Kubernetes. Engineers submitted more than 10,000 Ray jobs in the second quarter of 2025.</p>
			</div>
			<div class="cv-entry">
				<h3><a use:experienceSurface class="company-link" href="/experience/amazon/"><CompanyMark slug="amazon" /><span data-experience-part="title">Amazon</span></a></h3>
				<h4>Software Development Engineer Intern</h4>
				<span class="cv-date">May — August 2021 · May — August 2022 · Seattle</span>
				<p>
					Built a mentorship app and automated more than 600 emails per quarter with a Go service.
				</p>
			</div>
			<div class="cv-entry">
				<h3><a use:experienceSurface class="company-link" href="/experience/orca/"><CompanyMark slug="orca" /><span data-experience-part="title">Orca</span></a></h3>
				<h4>Founding Engineer</h4>
				<span class="cv-date">February — July 2022 · Austin</span>
				<p>
					Worked with two friends on a payments app for UT Austin students to send money and split bills.
					Built the React Native app, launch site and campus ads.
				</p>
			</div>
			<div class="cv-entry">
				<h3><a use:experienceSurface class="company-link" href="/experience/dive-chat/"><CompanyMark slug="dive-chat" /><span data-experience-part="title">Dive Chat</span></a></h3>
				<h4>Software Engineer</h4>
				<span class="cv-date">August 2020 — April 2022 · Austin</span>
				<p>Rewrote the React and TypeScript web client for a college group chat and event planning app. Worked with designers on mobile sign-up.</p>
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
						description="Helped build the GPU clusters that serve Roblox’s safety models. Wrote the Terraform and Kubernetes code that brought each cluster online in about 30 minutes."
					/>
				</li>
				<li>
					<LinkPreview
						href="https://about.roblox.com/newsroom/2024/09/running-ai-inference-at-scale-in-the-hybrid-cloud"
						title="Running AI Inference at Scale in the Hybrid Cloud"
						image="/assets/publications/hybrid-cloud.webp"
						source="Roblox" date="September 2024"
						description="Wrote the Go service and dashboard engineers used to submit and monitor Ray jobs. Helped launch the batch inference API on that platform."
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
				Built the VR interface for <a class="text-link" href="/projects/trill/">TRILL</a> during master’s research at the Robot Perception and Learning Lab. Used it to record demonstrations for teaching a humanoid robot household tasks.
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
