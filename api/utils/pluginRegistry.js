// utils/pluginRegistry.js
const registeredPlugins = new Set();

export function registerPluginOnce(schema, plugin, options) {
  const pluginKey = `${schema.modelName}-${plugin.name}-${JSON.stringify(options)}`;
  
  if (!registeredPlugins.has(pluginKey)) {
    schema.plugin(plugin, options);
    registeredPlugins.add(pluginKey);
  }
}