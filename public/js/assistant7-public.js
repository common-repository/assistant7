/**
 * Developed by StickyPages.ca
 * For Assistant7/Report7.co
 */
const tenant = assistant7vars.tenantId;
const collectionsSlug = assistant7vars.collectionsSlug || 'collection';
const productDetailsSlug = assistant7vars.productDetailsSlug || 'product';
const apiUrl = '//api.commerce7.com/v1';
let reviewsSummed = 0;

if(tenant.length < 1) {
	console.info('A7 > Please enter your tenant in the admin');
}

const reviewsFormSelector = '#assistant7-reviews-form2';
const reviewsListSelector = '#assistant7-reviews2';
const noReviewsText = 'Be the first to review!';
const collectionsPageProductTitleSelector = assistant7vars.collectionsPageProductTitleSelector || '.c7-product__title';
const productDetailsPageProductTitleSelector = assistant7vars.productDetailsPageProductTitleSelector || 'h1.c7-product-detail__titles';
const successReviewAddedText = 'Successfully added review!';
const alreadyInsertedReviewText = 'You have already submitted a review!';

(async function( $ ) {
	'use strict';

	// Define
	const pushState = history.pushState
	let pathArray
	let page
	let productSlug
	let avgRating
	const howManyCountsToCheckForData = 600

	const proxyHandler = {
		get(obj, prop) {
			return prop in obj ? obj[prop] : 0;
		}
	};
	const avgRatings = new Proxy({}, proxyHandler);
	const proxy = new Proxy({}, proxyHandler);


	/********************************
	 * HELPER FUNCTIONS
	 */
	function updateUrlParams() {
		pathArray = window.location.pathname.split('/').filter(Boolean);
		page = pathArray[0];
		productSlug = pathArray[pathArray.length-1];
		proxy.urlPage = pathArray[0];
		proxy.urlSlug = pathArray[pathArray.length-1];
		// console.log('A7 > PAGE', page)
	}
	function removePageElements() {
		const form = document.querySelector(`${reviewsFormSelector}`);
		if(form) {
			form.remove();
		}
		// Remove 'list of reviews'
		const reviews = document.querySelector(`${reviewsListSelector}`);
		if(reviews) {
			reviews.remove();
		}


		if (productDetailsSlug === page) {
			// Remove 'add review form'

			// Remove 'rating'
			const ratings = document.querySelectorAll(`.assistant7-rating`);
			if(ratings) {
				[].forEach.call(ratings, function(el) {
					el.remove();
				});
			}
		}

		else if (collectionsSlug === page) {
			// Remove 'rating'
			const rating = document.querySelector(`#assistant7-rating-`);
			if(rating) {
				rating.remove();
			}
		}

		else if ('other' === page) {

		}
	}


	/********************************
	 * REVIEWS
	 */
	async function displayReviewsForm() {
		// console.info('... Load Reviews Form')
		try {
			await a7_checkElement(`${reviewsFormSelector}`);
			let reviewsForm = $(`${reviewsFormSelector}`);

			// console.info('... ReviewsFormLoaded', reviewsForm)
			if (reviewsForm.length) {
				const form = a7_review_form(window.product.id);
				reviewsForm.append(form);

				// Set form fields
				// h1.c7-product-detail__titles
				a7_checkElement(`${productDetailsPageProductTitleSelector}`).then((el) => {
					$('#assistant7-add-review #productName').val(el.innerText);
					$('#assistant7-add-review #productSlug').val(a7_slugify(el.innerText));
				})
			}
		} catch(e) {
			console.error('E', e);
		}
	}
	function getReviews() {
		console.info('A7 > Load Product Reviews');

		a7_checkElement(`${reviewsListSelector}`).then(() => {
			let reviews = $(`${reviewsListSelector}`);
			const ret = {
				avgRating: 0
			}

			if (reviews.length) {
				$.ajax({
					url: `//api.report7.co/review/${window.product.id}`,
					data: {tenant}
				}).done(res => {
					avgRating = 0;

					if (res && (res._total > 0)) {
						for (let revKey in res.results) {
							if(revKey !== 'avgRating') {
								reviews.append(a7_template_review(res.results[revKey]));
							}
						}

						avgRatings[a7_slugify(window.product.title)] = res.avgRating;
						ret.avgRating = res.avgRating;
					} else {
						reviews.append('<div id="no-reviews">'+ noReviewsText +'</div>');
					}
				});
			}
			return ret;
		})
	}


	/********************************
	 * RATINGS
	 */
	function getAvgRating(productTitle) {
		if (!productTitle) {
			return
		}

		const productTitleSlug = a7_slugify(productTitle);
		console.log('getAvgRating > Get rating from API', productTitle, productTitleSlug);
		if(avgRatings[productTitleSlug]) {
			// console.log('A7 > Is already in ratings', avgRatings)
			return avgRatings[productTitleSlug]
		}

		// API
		$.ajax({
			url: `//api.report7.co/review/${productTitle}/byTitle`,
			data: {tenant}
		}).done(res => {
			if (res && (res._total > 0)) {
				// Add result to proxy
				avgRatings[productTitleSlug] = res.avgRating;
			}
		});

		return avgRatings[productTitleSlug];
	}
	function addRatingBelowTitles(bypassGetRating=false) {
		// Product Details Pages
		if (productDetailsSlug === page) {
			// c7-product__title || c7-product-detail__titles
			a7_checkElement(`${productDetailsPageProductTitleSelector}`).then((el) => {
				if(!el.innerText) {
					return
				}
				const slug = a7_slugify(el.innerText);
				const rating = avgRatings[slug];

				// Get rating
				if(slug) {
					if (!bypassGetRating) {
						getAvgRating(el.innerText);
					}

					const html = starRatingHtml(rating, slug, false);

					$(html).insertAfter(`${productDetailsPageProductTitleSelector}`);

					a7_checkElement('#assistant7-rating-').then(() => {
						const elements = document.querySelectorAll('#assistant7-rating-');
						elements.forEach(el => {
							el.remove();
						});
					});
				}
			});
		}

		// Collection Pages
		else if (collectionsSlug === page) {
			a7_checkElement(`${collectionsPageProductTitleSelector}`).then(() => {
				$(`${collectionsPageProductTitleSelector}`).each((_, el) => {
					if(!el.innerText) {
						return
					}

					const slug = a7_slugify(el.innerText);
					const rating = avgRatings[slug];

					if(slug) {
						getAvgRating(el.innerText);
						const html = starRatingHtml(rating, slug, false);
						$(html).insertAfter(el);
					}
				})
			});
		}

		// Other Pages
		else if ('other' === page) {
			// ... OTHER
		}
	}
	function starRatingHtml(rating = 0, id='', addLink = false) {
		let res = '';
		if(addLink) {
			res += '<a href="#assistant7-add-review" class="assistant7-goToReviews">';
		}
		res += `<div id="assistant7-rating-${id}" data-rating="${rating}" class="assistant7-rating" style="--rating: ${rating};" aria-label="Rating of this product is ${Math.floor(rating)} out of 5."></div>`
		if(addLink) {
			res += '</a>';
		}
		return res
	}
	function checkForAvgRatings() {
		let stop = 0;
		let timer = setInterval(function() {
			if (typeof avgRatings !== "undefined") {
				if (stop >= howManyCountsToCheckForData) {
					clearInterval(timer);
				}
				stop++;
				applyRatingToExistingElements();
			}
		}, 1000); // interval
	}
	function applyRatingToExistingElements() {
		Object.entries(avgRatings).forEach(entry => {
			const [key, value] = entry;
			try {
				const el = document.querySelector(`#assistant7-rating-${a7_slugify(key)}`)
				el.setAttribute('data-rating', value);
				el.setAttribute('style', `--rating: ${value}`);
			} catch {}
		});
	}

	// Create the elements required for the form on the product details page
	function createProductDetailElements() {
		a7_checkElement('#c7-content').then((c7content) => {
			$( "<div id='"+reviewsFormSelector.substring(1)+"'></div>" ).insertAfter("#c7-content");
			$( "<div id='"+reviewsListSelector.substring(1)+"'></div>" ).insertAfter("#c7-content");
			displayReviewsForm();
		})
	}


	/********************************
	 * Commerce7
	 */
	async function getProductFromC7() {
		if(productSlug && (productDetailsSlug === page) ) {
			await $.ajax({
				url: `${apiUrl}/product-for-web/${productSlug}`,
				headers: {tenant}
			}).done(prod => {
				window.product = prod;
			});
		}
	}


	// On initial page load
	async function init() {
		updateUrlParams();
		removePageElements();

		// Product details
		if(productSlug && (productDetailsSlug === page) ) {
			console.warn('A7 > PAGE = Product Details');

			await getProductFromC7();

			removePageElements();
			createProductDetailElements();

			getReviews();
			addRatingBelowTitles(true);
		}
		// Collections list
		else if (collectionsSlug === page) {
			console.warn('A7 > PAGE = Collection');
			removePageElements();
			addRatingBelowTitles();
		}
		// All others
		else {
			console.warn('A7 > PAGE = All Others');
			removePageElements();
			addRatingBelowTitles();
		}

		checkForAvgRatings();
	}
	await init()

	// Watch URL
	window.addEventListener('popstate', async function(event) {
		await init();
	})
	history.pushState = async function () {
		pushState.apply(history, arguments);
		await init();
	};

	// Submit review
	$(document).on('click', '#assistant7-submit-review', function(e) {
		e.preventDefault();

		let rev = {
			"tenant": tenant,
			"uuid": $('#assistant7-add-review #uuid').val(),
			"name": $('#assistant7-add-review #name').val(),
			"email": $('#assistant7-add-review #email').val(),
			"rating": $('.assistant7-rateme-input:checked').val(),
			"comments": $('#assistant7-add-review #comments').val(),
			"productName": $('#assistant7-add-review #productName').val(),
			"productSlug": $('#assistant7-add-review #productSlug').val()
		}

		if(!rev.productName) {
			console.error('A7 > No product available to review');
			displayModal(successReviewAddedText, 'error');
			return
		}
		$.ajax({
			type: "POST",
			url: `//api.report7.co/review`,
			data: JSON.stringify(rev),
		}).done(res => {
			if(res.code === 200 && res.results.payload) {
				$('#no-reviews').hide();
				$(`${reviewsListSelector}`).prepend(a7_template_review(JSON.parse(res.results.payload)));
				$('#assistant7-add-review #comments').val('');

				displayModal(successReviewAddedText, 'success');
			}
			else if(res.code === 200 && res.results.message === 'already inserted') {
				displayModal(alreadyInsertedReviewText, 'error');
			}
			else {
				displayModal(res.results.message, 'error');
			}
		});
	})
})( jQuery );

// Status = 'success' / 'error'
function displayModal(msg='', status='success') {
	let modal = document.querySelector(".a7-modal");
	let modalText = document.querySelector(".a7-modal-text");

	modal.style.display = 'block';
	if (status === 'success') {
		modal.classList.remove('error');
		modal.classList.add('success');
	} else if (status === 'error') {
		modal.classList.remove('success');
		modal.classList.add('error');
	}

	modalText.innerHTML = msg;
	let closeBtn = document.querySelector('.a7-close-btn');
	closeBtn.onclick = function() {
		modal.style.display = 'none';
	}
}

function a7_slugify(str) {
	str = str.replace(/^\s+|\s+$/g, '');
	str = str.toLowerCase();

	// remove accents, swap ñ for n, etc
	const from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;"
	const to = "aaaaeeeeiiiioooouuuunc------"
	for (var i=0, l=from.length ; i<l ; i++) {
		str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
	}

	str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // collapse whitespace and replace by -
		.replace(/-+/g, '-'); // collapse dashes

	return str;
}

async function a7_checkElement(selector) {
	while ( document.querySelector(selector) === null) {
		await new Promise( resolve =>  requestAnimationFrame(resolve) );
	}
	return document.querySelector(selector);
}

/* DISPLAY "FROM NOW TIME */
const a7_timeFromNow = function (time) {
	if (typeof time === 'string') {
		time = parseInt(time);
	}
	// Get timestamps
	const unixTime = new Date(time).getTime();
	if (!unixTime) return;
	const now = new Date().getTime();

	// Calculate difference (depends on what's being inputed)
	// var difference = (unixTime / 1000) - (now / 1000);
	let difference = (unixTime) - (now / 1000);
	const tfn = {}

	// Check if time is in the past, present, or future
	tfn.when = 'now';
	if (difference > 0) {
		tfn.when = 'future';
	} else if (difference < -1) {
		tfn.when = 'past';
	}

	// Convert difference to absolute
	difference = Math.abs(difference);

	// Calculate time unit
	if (difference / (60 * 60 * 24 * 365) > 1) {
		// Years
		tfn.unitOfTime = 'years';
		tfn.time = Math.floor(difference / (60 * 60 * 24 * 365));
	} else if (difference / (60 * 60 * 24 * 45) > 1) {
		// Months
		tfn.unitOfTime = 'months';
		tfn.time = Math.floor(difference / (60 * 60 * 24 * 45));
	} else if (difference / (60 * 60 * 24) > 1) {
		// Days
		tfn.unitOfTime = 'days';
		tfn.time = Math.floor(difference / (60 * 60 * 24));
	} else if (difference / (60 * 60) > 1) {
		// Hours
		tfn.unitOfTime = 'hours';
		tfn.time = Math.floor(difference / (60 * 60));
	} else if (difference / (60) > 1) {
		// Minutes
		tfn.unitOfTime = 'minutes';
		tfn.time = Math.floor(difference / (60));
	} else {
		// Seconds
		tfn.unitOfTime = 'seconds';
		tfn.time = Math.floor(difference);
	}
	return tfn;
}

/* TEMPLATE FOR EACH REVIEW */
function a7_template_review(e) {
	let ratings = '';
	let ago = '';
	let ratingsCount = 0;

	if(e.rating && e.rating < 6) {
		for (i = 0; i <= (e.rating-1); i++) {
			ratings += `<span></span>`;
			ratingsCount += 1;
		}
		reviewsSummed += ratingsCount;
	}
	if(e.docCreatedAt.length > 1) {
		let tAgo = a7_timeFromNow(e.docCreatedAt);
		ago += `<span class="assistant7-ago">`;
		if(tAgo.when === 'past') {
			ago += `${tAgo.time} ${tAgo.unitOfTime} ago`;
		}
		ago += `</span>`;
	}

	return `<div class="assistant7-review" itemType="http://schema.org/Product" itemScope>
		<meta itemProp="name" content="${e.productName}"/>

		<div itemProp="review" itemType="http://schema.org/Review" itemScope>
			<div itemProp="author" itemType="http://schema.org/Person" itemScope>
				<meta itemProp="name" content="${e.name}"/>
				<span class="assistant7-name">${e.name}</span> <span class="assistant7-ago">${ago}</span>
			</div>
			<div itemProp="reviewRating" class="assistant7-stars" itemType="http://schema.org/Rating" itemScope>
				<span class='assistant7-rating-display'>${ratings}</span>
				<meta itemProp="ratingValue" content="${ratingsCount}"/>
				<meta itemProp="bestRating" content="5"/>
			</div>
			<div class='assistant7-comment'>${e.comments}</div>
		</div>
	</div>`
}

/* REVIEW FORM */
function a7_review_form(uuid) {
	return `<a id="a7-reviews"></a><form id="assistant7-add-review">
	<div class="a7-wrapper">
		<div class="a7-col">
			<div class="a7-input"><label>Name<input id="name" name="name" type="text" placeholder="Name" required="required"></label></div>
		</div>
		<div class="a7-col">
			<div class="a7-input"><label>Email <small>(optional)</small><input id="email" name="email" type="email" placeholder="Email"></label></div>
		</div>
	</div>
	
	<div class="a7-input">
		<label>Comment<textarea id="comments" name="comments" required></textarea>
	</div>
	
	<div id="assistant7-rating-input">
		<label class="a7-hide">Rating</label>
		<div class="assistant7-rateme">
            <input id="star5" name="assistant7-rateme-input" type="radio" value="5" class="radio-btn a7-hide assistant7-rateme-input" />
            <label for="star5" >☆</label>
            <input id="star4" name="assistant7-rateme-input" type="radio" value="4" class="radio-btn a7-hide assistant7-rateme-input" />
            <label for="star4" >☆</label>
            <input id="star3" name="assistant7-rateme-input" type="radio" value="3" class="radio-btn a7-hide assistant7-rateme-input" />
            <label for="star3" >☆</label>
            <input id="star2" name="assistant7-rateme-input" type="radio" value="2" class="radio-btn a7-hide assistant7-rateme-input" />
            <label for="star2" >☆</label>
            <input id="star1" name="assistant7-rateme-input" type="radio" value="1" class="radio-btn a7-hide assistant7-rateme-input" />
            <label for="star1" >☆</label>
		</div>
	</div>
	
	<input type="hidden" name="productName" id="productName" value="">
	<input type="hidden" name="productSlug" id="productSlug" value="">
	<input type="hidden" name="uuid" id="uuid" value="${uuid}">
	<button id="assistant7-submit-review" class="c7-button">Submit</button>
</form>
<div class="a7-modal">
  <div class="a7-modal-content">
    <span class="a7-close-btn">&times;</span>
    <p class="a7-modal-text"></p>
  </div>
</div>
`
}
