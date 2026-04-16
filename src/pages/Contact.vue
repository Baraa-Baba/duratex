<script setup lang="ts">
import { onMounted, ref } from 'vue'

const currentUrl = ref('')

onMounted(() => {
  if (typeof window !== 'undefined') {
    currentUrl.value = window.location.href.split('#')[0]
  }
})
</script>

<template>
  <section class="section compact" style="padding-block: 10px;">
    <div class="container page-hero reveal" style="--delay: 0.05s"> 
      <h1>Contact Us.</h1>
      <p>
        Share your project details and our team will respond with finish recommendations,
        availability, and catalog guidance.
      </p>
    </div>
  </section>

  <section class="section" style="padding-top: 30px;">
    <div class="container contact-grid">
      <div class="contact-card reveal" style="--delay: 0.08s">
        <h2>Dubai Headquarters</h2>
        <p>DUBAI COMMERCITY UMM RAMOOL 
    11 17th St – BUILDING B2, Floor 1, Umm Ramool – DUBAI-UAE Office 1099.</p>
        <p class="contact-email">
          Email:
        </p>

        <p class="contact-email">
         <a href="mailto:info@duratex.co">info@duratex.co</a>
         </p>
        <p class="contact-email">
          Phone:
        </p>
        <p class="contact-email">
          <a href="tel:+971545981975">+971 54 598 1975</a>
        </p>
      </div>

      <div class="contact-card reveal" style="--delay: 0.12s">
        <h3>Send a message</h3>
        <form class="form-grid" action="https://formsubmit.co/info@duratex.co" method="POST">
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_subject" value="Duratex Middle East inquiry" />
          <input type="hidden" name="_next" :value="currentUrl" />
          <div>
            <label for="name">Full name</label>
            <input id="name" name="name" type="text" required />
          </div>
          <div>
            <label for="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div> 
          <div>
            <label for="message">Project details</label>
            <textarea id="message" name="message" required></textarea>
          </div>
          <button class="button" type="submit">Send inquiry</button>
        </form>
      </div>
    </div>
  </section>

  <section class="contact-map-section reveal" style="--delay: 0.15s">
    <iframe
      class="map-frame map-frame-full"
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3609.0397322533495!2d55.36800119999999!3d25.235586700000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5d7dde1f5b45%3A0xf38c8fb98b215428!2sDubai%20CommerCity!5e0!3m2!1sen!2slb!4v1776204985181!5m2!1sen!2slb"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      title="Duratex Middle East map"
    ></iframe>
  </section>
</template>
