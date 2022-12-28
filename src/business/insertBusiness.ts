export const insertBusiness = async (businessName: any, prisma: any) => {
  const insertBusiness = await prisma.business.create({
    data: {
      business_name: businessName,
    },
    select: {
      business_id: true,
    },
  });
  return insertBusiness.business_id;
};
