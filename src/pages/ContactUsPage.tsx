const ContactUsPage = () => (
  <section className="bg-[#F8F4F1] px-4 py-16 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-3xl rounded-2xl border border-[#E7DFDB] bg-white px-6 py-12 text-center shadow-sm sm:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8B0000]">RoomReview</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2D3D] sm:text-4xl">Contact Us</h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#516078]">
        We welcome your questions, feedback, and enquiries.
      </p>
      <div className="mt-8 space-y-3 border-t border-[#E7DFDB] pt-6 text-sm leading-6 text-[#516078]">
        <p>
          <span className="font-semibold text-[#1F2D3D]">Registered office:</span>{' '}
          51a-53a High Road, London, England, NW10 2SU
        </p>
        <p>
          <span className="font-semibold text-[#1F2D3D]">Email:</span>{' '}
          <a className="text-[#8B0000] underline underline-offset-2" href="mailto:info@roomreview.co.uk">
            info@roomreview.co.uk
          </a>
        </p>
      </div>
    </div>
  </section>
);

export default ContactUsPage;
