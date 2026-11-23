<script lang="ts">
export interface Technology {
    name: string;
    svg: string;
    proficiency: 1.5 | 2 | 3 | 3.5 | 4 | 5;
    description: string;
    type: 'infra' | 'framework' | 'language';
    padding?: number; // 0-1, percentage of radius to use as padding
}
import { onMount, onDestroy } from 'svelte';
import { browser } from '$app/environment';
import * as d3 from 'd3';
import { headerAnimationComplete } from '../stores';

    interface Props {
        technologies?: Technology[];
    }

    let { technologies = [] }: Props = $props();
const chartId = $props.id();

// Scale factor for bubble sizes based on proficiency
const BUBBLE_SIZE_SCALE = 10;
const MOBILE_BREAKPOINT = 600;
const MOBILE_CHART_HEIGHT = 620;

interface Node extends Technology, d3.SimulationNodeDatum {
    id: number;
    r: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    fx: number | null;
    fy: number | null;
    isExpanded?: boolean;
    originalRadius?: number;
}

let svg: SVGElement | undefined = $state();
let container: HTMLDivElement | undefined = $state();
let width = $state(browser ? document.documentElement.clientWidth : 1024); // Default width for SSR
let height = $derived(width < MOBILE_BREAKPOINT ? MOBILE_CHART_HEIGHT : 400);
let centerX = $derived(width * 0.5);
let centerY = $derived(height * 0.5);
let simulation: d3.Simulation<Node, undefined>;
let lastScrollY = 0;
let scrollVelocity = 0;
let scrollTimeout: number;
let resetInterval: ReturnType<typeof setInterval> | undefined;
let reducedMotion = false;
let currentForceY = 0;
let isVisible = false;
let hasAnimated = false;
let expandedNode: Node | null = null;
let isDragging = false;
let headerAnimationDone = $state(false);
const paddingX = 10;
const paddingY = 50;
const collisionRadius = (node: Node) => node.r + (width < MOBILE_BREAKPOINT ? 4 : 2);

// Subscribe to the header animation state
const unsubscribe = headerAnimationComplete.subscribe(value => {
    headerAnimationDone = value;
    if (headerAnimationDone && isVisible && !hasAnimated) {
        startAnimation();
        hasAnimated = true;
    }
});

// Handle scroll events with debouncing
function handleScroll() {
    if (!browser || !simulation || !isVisible || reducedMotion) return;
    
    const currentScrollY = window.scrollY;
    scrollVelocity = (currentScrollY - lastScrollY) * 0.5;
    lastScrollY = currentScrollY;

    currentForceY = currentForceY * 0.8 - scrollVelocity;

    simulation.force('scroll', d3.forceY<Node>().strength(0.1).y(d => {
        return (d.y || 0) + currentForceY;
    }));

    simulation.alpha(0.5).restart();

    if (scrollTimeout) clearTimeout(scrollTimeout);

    scrollTimeout = window.setTimeout(() => {
        clearInterval(resetInterval);
        resetInterval = setInterval(() => {
            if (Math.abs(currentForceY) < 0.1) {
                currentForceY = 0;
                simulation.force('scroll', null);
                simulation.alpha(0.3).restart();
                clearInterval(resetInterval);
            } else {
                currentForceY *= 0.7;
                simulation.force('scroll', d3.forceY<Node>().strength(0.1).y(d => {
                    return (d.y || 0) + currentForceY;
                }));
                simulation.alpha(0.3).restart();
            }
        }, 50);
    }, 100);
}

function debouncedScroll() {
    if (!browser) return;
    requestAnimationFrame(handleScroll);
}

// Define cluster centers based on screen size
function getClusterCenters() {
    const isMobile = width < MOBILE_BREAKPOINT; // Use consistent breakpoint
    const types = ['infra', 'framework', 'language'] as const;
    const maxContentWidth = 800; // Maximum content width
    
    if (isMobile) {
        // Separate the infrastructure group from the two lower groups.
        const horizontalSpacing = width * 0.1;
        
        return types.reduce((acc, type, i) => {
            switch(i) {
                case 0: // Top center
                    acc[type] = {
                        x: width / 2,
                        y: height * 0.34
                    };
                    break;
                case 1: // Bottom left
                    acc[type] = {
                        x: width / 2 - horizontalSpacing,
                        y: height * 0.62
                    };
                    break;
                case 2: // Bottom right
                    acc[type] = {
                        x: width / 2 + horizontalSpacing,
                        y: height * 0.62
                    };
                    break;
            }
            return acc;
        }, {} as Record<typeof types[number], {x: number, y: number}>);
    } else {
        // Horizontal arrangement for desktop - spread out more
        const effectiveWidth = Math.min(width, maxContentWidth); // Use maxContentWidth as the limit
        const totalWidth = effectiveWidth * 0.5; // Use 50% of the width for more spread out layout
        const horizontalSpacing = totalWidth / (types.length - 1); // Space between clusters
        const startX = (width - totalWidth) / 2; // Center the cluster group in the viewport
        
        return types.reduce((acc, type, i) => {
            acc[type] = {
                x: startX + horizontalSpacing * i,
                y: height / 2
            };
            return acc;
        }, {} as Record<typeof types[number], {x: number, y: number}>);
    }
}

function initializeSimulation() {
    if (!browser || !container || nodes.length === 0) return;

    // Span the viewport while leaving room for classic scrollbars.
    width = document.documentElement.clientWidth;
    centerX = width * 0.5;
    centerY = height * 0.5;

    // Get cluster centers based on current screen size
    const clusterCenters = getClusterCenters();
    const isMobile = width < 768;

    // Initialize positions before creating nodes
    nodes.forEach(node => {
        if (isMobile) {
            // Mobile-specific initialization based on node type
            const center = clusterCenters[node.type];
            const distance = 3000; // Distance from edge
            
            switch(node.type) {
                case 'infra': // Top center group
                    node.x = center.x + (Math.random() - 0.5) * width * 0.5; // Spread horizontally
                    node.y = -distance; // Start from above
                    break;
                case 'framework': // Bottom left group
                    node.x = -distance; // Start from left
                    node.y = height + distance; // and below
                    break;
                case 'language': // Bottom right group
                    node.x = width + distance; // Start from right
                    node.y = height + distance; // and below
                    break;
            }
        } else {
            // Desktop initialization (keep existing wide spread)
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.max(width, height) * 3;
            const side = Math.floor(Math.random() * 4);
            
            switch(side) {
                case 0: // top
                    node.x = Math.random() * width;
                    node.y = -distance;
                    break;
                case 1: // right
                    node.x = width + distance;
                    node.y = Math.random() * height;
                    break;
                case 2: // bottom
                    node.x = Math.random() * width;
                    node.y = height + distance;
                    break;
                case 3: // left
                    node.x = -distance;
                    node.y = Math.random() * height;
                    break;
            }
        }
        node.vx = 0;
        node.vy = 0;
    });

    simulation = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(-80))
        .force('collide', d3.forceCollide<Node>(collisionRadius).strength(0.9))
        .force('x', d3.forceX<Node>(d => clusterCenters[d.type].x).strength(0.07))
        .force('y', d3.forceY<Node>(d => clusterCenters[d.type].y).strength(0.07))
        .force('bounds', () => {
            nodes.forEach(d => {
                if (d.x - d.r < paddingX) d.x = d.r + paddingX;
                if (d.x + d.r > width - paddingX) d.x = width - d.r - paddingX;
                if (d.y - d.r < paddingY) d.y = d.r + paddingY;
                if (d.y + d.r > height - paddingY) d.y = height - d.r - paddingY;
            });
        })
        .alphaDecay(0.02);

    simulation.stop();

    const svgElement = svg ? d3.select(svg) : null;
    if (!svgElement) return;
    
    svgElement.attr('viewBox', `0 0 ${width} ${height}`)
             .attr('preserveAspectRatio', 'xMidYMid meet');

    const node = svgElement.selectAll<SVGGElement, Node>('.node')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('role', 'button')
        .attr('tabindex', 0)
        .attr('aria-label', d => d.name)
        .attr('aria-description', d => d.description)
        .attr('aria-pressed', 'false')
        .on('click', (event, d) => { isDragging = false; handleNodeClick(event, d); })
        .on('keydown', (event: KeyboardEvent, d) => {
            if (event.key === 'Enter' || event.key === ' ' || (event.key === 'Escape' && d.isExpanded)) {
                event.preventDefault();
                isDragging = false;
                handleNodeClick(event, d);
            }
        })
        .style('opacity', '0')
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .call(d3.drag<SVGGElement, Node>()
            // Taps still open a bubble. A swipe over one should scroll the page.
            .touchable(() => false)
            .on('start', (event, d) => {
                isDragging = false;
                if (!event.active) simulation.alphaTarget(0.2).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                isDragging = true;
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                // Always clear fixed position on drag end
                d.fx = null;
                d.fy = null;
            }));

    function handleNodeClick(event: Event, d: Node) {
        if (isDragging) return;
        event.stopPropagation();

        const previous = expandedNode;
        if (previous && previous !== d) {
            previous.isExpanded = false;
            previous.r = previous.originalRadius!;
        }
        d.isExpanded = !d.isExpanded;
        d.r = d.isExpanded ? maxRadius : d.originalRadius!;
        expandedNode = d.isExpanded ? d : null;

        const changed = node.filter(item => item === previous || item === d);
        changed.attr('aria-pressed', item => String(Boolean(item.isExpanded)));
        const surfaces = changed.select<SVGCircleElement>('.bubble-surface').interrupt('radius');

        simulation.force('collide', d3.forceCollide<Node>(collisionRadius).strength(0.9));
        if (reducedMotion) {
            surfaces.attr('r', item => item.r);
            simulation.alpha(0.5).stop().tick(160);
            positionNodes();
        } else {
            surfaces.transition('radius').duration(210).ease(d3.easeCubicOut).attr('r', item => item.r);
            simulation.alpha(0.5).restart();
        }
    }

    // The clip uses the painted circle itself, including its radius between animation frames.
    svgElement.select('defs').selectAll('clipPath')
        .data(nodes).join('clipPath')
        .attr('id', d => `${chartId}-clip-${d.id}`)
        .append('use')
        .attr('href', d => `#${chartId}-surface-${d.id}`);

    node.append('circle')
        .attr('class', 'bubble-surface')
        .attr('id', d => `${chartId}-surface-${d.id}`)
        .attr('r', (d: Node) => d.r)
        .attr('fill', 'url(#technology-surface)')
        .attr('stroke', 'var(--bubble-edge)')
        .style('cursor', 'pointer');

    const content = node.append('g')
        .attr('clip-path', d => `url(#${chartId}-clip-${d.id})`)
        .attr('aria-hidden', 'true')
        .style('pointer-events', 'none');

    content.append('image')
        .attr('class', 'tech-icon')
        .attr('href', d => d.svg)
        .each(function(d) {
            const halfSize = d.r * (1 - (d.padding ?? 0.3));
            d3.select(this).attr('x', -halfSize).attr('y', -halfSize)
                .attr('width', 2 * halfSize).attr('height', 2 * halfSize);
        });

    const labels = content.append('g')
        .attr('class', 'tech-text')
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--bubble-ink)');

    labels.append('text').attr('class', 'name-text')
        .attr('font-size', 14).attr('font-weight', 'bold').text(d => d.name);
    labels.append('text').attr('class', 'desc-text').attr('font-size', 12);

    function wrapLabels() {
        labels.each(function(d) {
            const label = d3.select(this);
            const text = label.select<SVGTextElement>('.desc-text');
            text.text(null);
            const measure = text.append('tspan');
            const lines: string[] = [];
            let line = '';
            for (const word of d.description.split(/\s+/)) {
                const candidate = line ? line + ' ' + word : word;
                measure.text(candidate);
                if (line && measure.node()!.getComputedTextLength() > maxRadius * 1.4) {
                    lines.push(line);
                    line = word;
                } else {
                    line = candidate;
                }
            }
            lines.push(line);
            measure.remove();
            const lineHeight = 15;
            const titleY = -(lines.length * lineHeight) / 2;
            label.select('.name-text').attr('y', titleY);
            text.selectAll('tspan').data(lines).join('tspan')
                .attr('x', 0).attr('y', (_, i) => titleY + 20 + i * lineHeight)
                .text((value, i) => value + (i < lines.length - 1 ? ' ' : ''));
        });
    }
    wrapLabels();
    if (document.fonts.status === 'loading') {
        void document.fonts.ready.then(() => { if (svg?.isConnected) wrapLabels(); });
    }

    // Remove tooltip since we're showing info on click
    node.selectAll('title').remove();

    function positionNodes() {
        node.attr('transform', d => `translate(${d.x},${d.y})`);
    }
    simulation.on('tick', positionNodes);
}

// Export method to start animation
export function startAnimation() {
    if (!simulation || !svg) return;

    if (reducedMotion) {
        const centers = getClusterCenters();
        nodes.forEach((node, index) => {
            const center = centers[node.type];
            node.x = center.x + Math.cos(index * 2.4) * 70;
            node.y = center.y + Math.sin(index * 2.4) * 70;
            node.vx = node.vy = 0;
        });
        simulation.alpha(1).stop().tick(240);
        d3.select(svg).selectAll<SVGGElement, Node>('.node')
            .attr('transform', d => `translate(${d.x},${d.y})`).style('opacity', '1');
        isVisible = true;
        return;
    }

    // Reset node positions and velocities
    nodes.forEach(node => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(width, height, 1000) * 3; // 1000 is used for mobile devices to have a more dramatic effect
        const side = Math.floor(Math.random() * 4);
        
        switch(side) {
            case 0: // top
                node.x = Math.random() * width; // Spread horizontally
                node.y = -distance;
                break;
            case 1: // right
                node.x = width + distance;
                node.y = Math.random() * height; // Spread vertically
                break;
            case 2: // bottom
                node.x = Math.random() * width; // Spread horizontally
                node.y = height + distance;
                break;
            case 3: // left
                node.x = -distance;
                node.y = Math.random() * height; // Spread vertically
                break;
        }
        node.vx = 0;
        node.vy = 0;
    });

    // Update positions before starting animation
    d3.select(svg)
        .selectAll<SVGGElement, Node>('.node')
        .attr('transform', (d: Node) => `translate(${d.x},${d.y})`)
        .style('opacity', '0')
        .transition()
        .duration(reducedMotion ? 0 : 800)
        .style('opacity', '1');

    isVisible = true;
    simulation.alpha(1).restart();
}

onMount(() => {
    if (!browser) return;
    reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    initializeSimulation();
    window.addEventListener('scroll', debouncedScroll, { passive: true });

    // Add resize handler
    const handleResize = () => {
        const nextWidth = document.documentElement.clientWidth;
        // Ignore transient collapsed viewports and height-only changes (e.g. browser chrome).
        if (nextWidth < maxRadius * 2 + paddingX * 2 || nextWidth === width) return;
        width = nextWidth;
        centerX = width * 0.5;
        
        // Update SVG viewBox
        if (svg) {
            d3.select(svg)
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');
        }

        // Update cluster centers and forces
        if (simulation) {
            const newClusterCenters = getClusterCenters();
            simulation
                .force('x', d3.forceX<Node>(d => newClusterCenters[d.type].x).strength(0.08))
                .force('y', d3.forceY<Node>(d => newClusterCenters[d.type].y).strength(0.08))
                .force('collide', d3.forceCollide<Node>(collisionRadius).strength(0.9));
            if (reducedMotion && hasAnimated) startAnimation();
            else simulation.alpha(0.3).restart();
        }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Set up intersection observer
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    isVisible = true;
                    if (headerAnimationDone && !hasAnimated) {
                        startAnimation();
                        hasAnimated = true;
                        observer.disconnect(); // Only trigger once
                    }
                }
            });
        },
        {
            root: null,
            threshold: 0,
            rootMargin: '-33% 0px' // Trigger when element reaches 1/3 of the viewport
        }
    );

    if (container) observer.observe(container);

    return () => {
        observer.disconnect();
        window.removeEventListener('scroll', debouncedScroll);
        window.removeEventListener('resize', handleResize);
        if (scrollTimeout) clearTimeout(scrollTimeout);
        clearInterval(resetInterval);
        if (simulation) simulation.stop();
    };
});

onDestroy(() => {
    unsubscribe();
    clearInterval(resetInterval);
    if (!browser) return;
    window.removeEventListener('scroll', debouncedScroll);
    if (scrollTimeout) clearTimeout(scrollTimeout);
    if (simulation) simulation.stop();
});
// Convert technologies to nodes with sized based on proficiency
let nodes = $derived(technologies.map((tech, index) => ({
    ...tech,
    id: index,
    r: tech.proficiency * BUBBLE_SIZE_SCALE,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    fx: null,
    fy: null,
    isExpanded: false,
    originalRadius: tech.proficiency * BUBBLE_SIZE_SCALE
})) as Node[]);
// Calculate the maximum radius for expanded state
let maxRadius = $derived(Math.max(0, ...technologies.map(tech => tech.proficiency)) * BUBBLE_SIZE_SCALE * 2);
</script>

<div class="bubble-chart-container"
    style:--chart-width={browser ? width + 'px' : undefined}
    style:--chart-mobile-height={MOBILE_CHART_HEIGHT + 'px'}>
    <div class="bubble-chart-wrapper">
        <div class="bubble-chart" bind:this={container} role="group" aria-label="Technologies — select a bubble to learn more">
            <svg 
                bind:this={svg}
                width="100%" 
                {height}
                style="background-color: transparent;"
            >
                <defs>
                    <radialGradient id="technology-surface" cx="35%" cy="20%" r="85%">
                        <stop offset="0%" stop-color="var(--bubble-highlight)" />
                        <stop offset="100%" stop-color="var(--bubble-surface)" />
                    </radialGradient>
                </defs>
            </svg>
        </div>
    </div>
</div>

<style>
.bubble-chart-container {
    position: relative;
    margin: -50px calc(var(--chart-width, 100vw) / -2);
    height: var(--chart-height, 400px);
    overflow: hidden;
    display: flex;
    align-items: center;
    left: 50%;
    width: var(--chart-width, 100vw);
    pointer-events: none;
}

@media (max-width: 600px) {
    .bubble-chart-container {
        --chart-height: var(--chart-mobile-height);
        margin-block: 0;
    }
}

.bubble-chart-wrapper {
    position: relative;
    width: 100%;
}

.bubble-chart {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    touch-action: pan-y pinch-zoom;
}

:global(.node) {
    cursor: pointer;
    pointer-events: all;
}

.bubble-chart :global(.tech-icon) {
    opacity: 1;
    transition: opacity 75ms ease-out;
}
.bubble-chart :global(.tech-text) {
    opacity: 0;
    transition: opacity 45ms linear;
}
.bubble-chart :global(.node[aria-pressed="true"] .tech-icon) { opacity: 0; }
.bubble-chart :global(.node[aria-pressed="true"] .tech-text) {
    opacity: 1;
    transition: opacity 75ms ease-out 55ms;
}
@media (prefers-reduced-motion: reduce) {
    .bubble-chart :global(.node .tech-icon),
    .bubble-chart :global(.node .tech-text),
    .bubble-chart :global(.node[aria-pressed="true"] .tech-text) { transition: none; }
}

.bubble-chart :global(.node:hover circle) {
    filter: brightness(1.12);
}

.bubble-chart :global(.node:focus) { outline: none; }
.bubble-chart :global(.node:focus-visible circle) { stroke: var(--muted) !important; stroke-width: 3px; paint-order: stroke; }

.bubble-chart :global(svg) {
    pointer-events: none;
}
</style>
