<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://stickypages.ca
 * @since             1.0.0
 * @package           Assistant7
 *
 * @wordpress-plugin
 * Plugin Name:       Assistant7
 * Plugin URI:        https://report7.co
 * Description:       Integrations with Commerce7 and Assistant7 Tools, (Guest Counters, Product Reviews, Reports, etc)
 * Version:           2.0.8
 * Author:            StickyPages
 * Author URI:        https://stickypages.ca
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       assistant7
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'ASSISTANT7_VERSION', '2.0.8' );

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-assistant7-activator.php
 */
function activate_assistant7() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-assistant7-activator.php';
	Assistant7_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-assistant7-deactivator.php
 */
function deactivate_assistant7() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-assistant7-deactivator.php';
	Assistant7_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_assistant7' );
register_deactivation_hook( __FILE__, 'deactivate_assistant7' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-assistant7.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_assistant7() {

	$plugin = new Assistant7();
	$plugin->run();

}
run_assistant7();
