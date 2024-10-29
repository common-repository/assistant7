<?php

/**
 * Provide a admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @link       https://stickypages.ca
 * @since      1.0.0
 *
 * @package    Assistant7
 * @subpackage Assistant7/admin/partials
 */

if ( ! defined( 'WPINC' ) ) die;
?>

<!-- This file should primarily consist of HTML with a little bit of PHP. -->
<div class="wrap">
    <img src="<?php echo plugins_url('../img/Assistant7.svg', __FILE__); ?>" class="assistant7-logo">
    <h2><?php esc_attr_e('Options', 'assistant7' ); ?></h2>

    <form method="post" name="<?php echo $this->plugin_name; ?>" action="options.php">
        <?php
        //Grab all options
        $options = get_option( $this->plugin_name );

        $tenantId = ( isset( $options['tenantId'] ) && ! empty( $options['tenantId'] ) ) ? esc_attr( $options['tenantId'] ) : '';
        $collectionsSlug = ( isset( $options['collectionsSlug'] ) && ! empty( $options['collectionsSlug'] ) ) ? esc_attr( $options['collectionsSlug'] ) : 'collection';
        $productDetailsSlug = ( isset( $options['productDetailsSlug'] ) && ! empty( $options['productDetailsSlug'] ) ) ? esc_attr( $options['productDetailsSlug'] ) : 'product';
        $collectionsPageProductTitleSelector = ( isset( $options['collectionsPageProductTitleSelector'] ) && ! empty( $options['collectionsPageProductTitleSelector'] ) ) ? esc_attr( $options['collectionsPageProductTitleSelector'] ) : '.c7-product__title';
        $productDetailsPageProductTitleSelector = ( isset( $options['productDetailsPageProductTitleSelector'] ) && ! empty( $options['productDetailsPageProductTitleSelector'] ) ) ? esc_attr( $options['productDetailsPageProductTitleSelector'] ) : 'h1.c7-product-detail__titles';

        settings_fields($this->plugin_name);
        do_settings_sections($this->plugin_name);

        ?>

        <!-- Text -->
        <fieldset>
            <p><?php esc_attr_e( 'Tenant Id', 'assistant7' ); ?></p>
            <legend class="screen-reader-text">
                <span><?php esc_attr_e( 'Tenant Id', 'assistant7' ); ?></span>
            </legend>
            <input type="text" class="tenantId" id="<?php echo $this->plugin_name; ?>-tenantId" name="<?php echo $this->plugin_name; ?>[tenantId]" value="<?php if( ! empty( $tenantId ) ) echo $tenantId; else echo 'default'; ?>"/>
        </fieldset>
        <fieldset>
            <p><?php esc_attr_e( 'Collection Slug', 'assistant7' ); ?></p>
            <legend class="screen-reader-text">
                <span><?php esc_attr_e( 'Collection Slug', 'assistant7' ); ?></span>
            </legend>
            <input type="text" class="collectionsSlug" id="<?php echo $this->plugin_name; ?>-collectionsSlug" name="<?php echo $this->plugin_name; ?>[collectionsSlug]" value="<?php if( ! empty( $collectionsSlug ) ) echo $collectionsSlug; else echo 'collection'; ?>"/>
        </fieldset>
        <fieldset>
            <p><?php esc_attr_e( 'Product Details Slug', 'assistant7' ); ?></p>
            <legend class="screen-reader-text">
                <span><?php esc_attr_e( 'Product Details Slug', 'assistant7' ); ?></span>
            </legend>
            <input type="text" class="productDetailsSlug" id="<?php echo $this->plugin_name; ?>-productDetailsSlug" name="<?php echo $this->plugin_name; ?>[productDetailsSlug]" value="<?php if( ! empty( $productDetailsSlug ) ) echo $productDetailsSlug; else echo 'product'; ?>"/>
        </fieldset>
        <fieldset>
            <p><?php esc_attr_e( 'Collection Page Product Title Selector', 'assistant7' ); ?></p>
            <legend class="screen-reader-text">
                <span><?php esc_attr_e( 'Collection Page Product Title Selector', 'assistant7' ); ?></span>
            </legend>
            <input type="text" class="collectionsPageProductTitleSelector" id="<?php echo $this->plugin_name; ?>-collectionsPageProductTitleSelector" name="<?php echo $this->plugin_name; ?>[collectionsPageProductTitleSelector]" value="<?php if( ! empty( $collectionsPageProductTitleSelector ) ) echo $collectionsPageProductTitleSelector; else echo '.c7-product__title'; ?>"/>
        </fieldset>
        <fieldset>
            <p><?php esc_attr_e( 'Product Details Product Title Selector', 'assistant7' ); ?></p>
            <legend class="screen-reader-text">
                <span><?php esc_attr_e( 'Product Details Product Title Selector', 'assistant7' ); ?></span>
            </legend>
            <input type="text" class="productDetailsPageProductTitleSelector" id="<?php echo $this->plugin_name; ?>-productDetailsPageProductTitleSelector" name="<?php echo $this->plugin_name; ?>[productDetailsPageProductTitleSelector]" value="<?php if( ! empty( $productDetailsPageProductTitleSelector ) ) echo $productDetailsPageProductTitleSelector; else echo 'h1.c7-product-detail__titles'; ?>"/>
        </fieldset>

        <?php submit_button( __( 'Save all changes', 'assistant7' ), 'primary','submit', TRUE ); ?>

    </form>
</div>
