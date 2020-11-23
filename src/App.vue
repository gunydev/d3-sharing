<template>
	<div id="app">
		<HelloWorld msg="Welcome to Your Awesome D3.js App" />
		<Graph />
	</div>
</template>

<script>
export default {
	name: 'App',
	components: {
		HelloWorld: () => import('./components/HelloWorld.vue'),
		Graph: () => import('./components/Graph.vue')
	}
}
</script>

<style lang="scss">
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
</style>
